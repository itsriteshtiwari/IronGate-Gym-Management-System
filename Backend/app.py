# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, date

app = Flask(__name__)
CORS(app) # Allows React to talk to Python

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Anchal@59x", 
        database="irongate_gym" # Update with your DB details
    )

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    pin = data.get('pin')
    role = data.get('role')

    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Simple login logic based on your prototype
    cursor.execute("SELECT id, name, role FROM users WHERE id = %s AND pin = %s AND role = %s", (username, pin, role))
    user = cursor.fetchone()
    
    if user:
        return jsonify({"success": True, "user": user})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

# backend/app.py (Add these to your existing file)

@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    today = date.today()
    
    try:
        # Total Members
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE role = 'user'")
        total_members = cursor.fetchone()['total']
        
        # Active Today
        cursor.execute("SELECT COUNT(DISTINCT user_id) as active_today FROM attendance WHERE log_date = %s", (today,))
        active_today = cursor.fetchone()['active_today']

        # Currently in Gym (Checked in today, no checkout time)
        cursor.execute("""
            SELECT a.time_in, u.name, p.name as package_name 
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN memberships m ON u.id = m.user_id
            LEFT JOIN packages p ON m.package_id = p.id
            WHERE a.log_date = %s AND a.time_out IS NULL
        """, (today,))
        in_gym = cursor.fetchall()

        # Today's Activity
        cursor.execute("""
            SELECT u.name, a.time_in, a.time_out 
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE a.log_date = %s
        """, (today,))
        activity = cursor.fetchall()

        # For formatting times in Python before sending to React
        for item in in_gym:
            item['time_in'] = str(item['time_in']) if item['time_in'] else None
        for item in activity:
            item['time_in'] = str(item['time_in']) if item['time_in'] else None
            item['time_out'] = str(item['time_out']) if item['time_out'] else None

        return jsonify({
            "success": True,
            "total_members": total_members,
            "active_today": active_today,
            "active_members": total_members, # Simplified for now
            "expired": 0, # Simplified for now
            "in_gym": in_gym,
            "activity": activity
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/admin/packages', methods=['GET', 'POST'])
def handle_packages():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    if request.method == 'GET':
        # Only fetch active packages (hides removed ones)
        cursor.execute("SELECT * FROM packages WHERE is_active = TRUE")
        packages = cursor.fetchall()
        return jsonify({"success": True, "packages": packages})
        
    if request.method == 'POST':
        data = request.json
        # Generate ID (e.g., "Summer Promo" -> "summer_promo")
        pkg_id = data['name'].lower().replace(" ", "_") 
        try:
            cursor.execute(
                "INSERT INTO packages (id, name, price_per_month, offers, is_active) VALUES (%s, %s, %s, %s, TRUE)",
                (pkg_id, data['name'], data['price'], data['offers'])
            )
            db.commit()
            return jsonify({"success": True})
        except Exception as e:
            db.rollback()
            return jsonify({"success": False, "error": str(e)}), 500
        finally:
            cursor.close()
            db.close()

@app.route('/api/admin/attendance', methods=['GET'])
def get_attendance():
    date_param = request.args.get('date', date.today().strftime('%Y-%m-%d'))
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT u.id, u.name, a.time_in, a.time_out 
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE a.log_date = %s
            ORDER BY a.time_in ASC
        """, (date_param,))
        records = cursor.fetchall()
        
        # Format times
        for r in records:
            r['time_in'] = str(r['time_in'])
            r['time_out'] = str(r['time_out']) if r['time_out'] else None
            
        return jsonify({"success": True, "records": records})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/admin/members', methods=['GET', 'POST'])
def handle_members():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    if request.method == 'GET':
        try:
            # Get users and calculate their remaining days based on their latest membership
            query = """
            SELECT u.id, u.name, m.start_date, m.total_days, p.name as pkg_name,
                   (SELECT COUNT(DISTINCT log_date) FROM attendance WHERE user_id = u.id AND log_date >= m.start_date) as attended
            FROM users u
            LEFT JOIN memberships m ON u.id = m.user_id AND m.id = (SELECT MAX(id) FROM memberships WHERE user_id = u.id)
            LEFT JOIN packages p ON m.package_id = p.id
            WHERE u.role = 'user'
            """
            cursor.execute(query)
            users = cursor.fetchall()
            
            members_list = []
            for user in users:
                # Calculate days left
                total = user['total_days'] if user['total_days'] else 0
                attended = user['attended'] if user['attended'] else 0
                left = max(0, total - attended)
                
                # Determine status
                status = 'Active' if left > 5 else ('Expiring' if left > 0 else 'Expired')
                
                members_list.append({
                    "id": user['id'],
                    "name": user['name'],
                    "pkg": user['pkg_name'] or '--',
                    "left": left,
                    "status": status,
                    "joined": str(user['start_date']) if user['start_date'] else '--'
                })
            return jsonify({"success": True, "members": members_list})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
        finally:
            cursor.close()
            db.close()

    if request.method == 'POST':
        data = request.json
        try:
            # 1. Generate a new Member ID (e.g., M001, M002)
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role='user'")
            count = cursor.fetchone()['count']
            new_id = f"M{str(count + 1).zfill(3)}"
            
            # 2. Insert into Users table
            cursor.execute(
                "INSERT INTO users (id, role, name, phone, email, pin, fingerprint_registered) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (new_id, 'user', data['name'], data['phone'], data['email'], data['pin'], data['fingerprint'])
            )
            
            # 3. Insert into Memberships table (Convert months to days: 1 month = 30 days)
            total_days = int(data['duration']) * 30
            cursor.execute(
                "INSERT INTO memberships (user_id, package_id, start_date, total_days) VALUES (%s, %s, %s, %s)",
                (new_id, data['packageId'], date.today(), total_days)
            )
            
            db.commit()
            return jsonify({"success": True, "new_id": new_id})
        except Exception as e:
            db.rollback()
            return jsonify({"success": False, "error": str(e)}), 500
        finally:
            cursor.close()
            db.close()

# --- USER ROUTES ---

@app.route('/api/user/<user_id>/overview', methods=['GET'])
def user_overview(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT m.start_date, m.total_days, p.name as pkg_name, p.price_per_month, p.offers
            FROM memberships m
            JOIN packages p ON m.package_id = p.id
            WHERE m.user_id = %s 
            ORDER BY m.id DESC LIMIT 1
        """, (user_id,))
        membership = cursor.fetchone()

        if not membership:
            return jsonify({"success": False, "message": "No active membership found"}), 404

        cursor.execute("""
            SELECT COUNT(DISTINCT log_date) as attended_days 
            FROM attendance WHERE user_id = %s AND log_date >= %s
        """, (user_id, membership['start_date']))
        
        attended_days = cursor.fetchone()['attended_days']
        days_left = max(0, membership['total_days'] - attended_days) 
        
        # Convert comma-separated string to list
        offers = membership['offers'].split(',') if membership['offers'] else []

        return jsonify({
            "success": True,
            "total_days": membership['total_days'],
            "attended_days": attended_days,
            "days_left": days_left,
            "start_date": membership['start_date'].strftime('%Y-%m-%d'),
            "package": {
                "name": membership['pkg_name'],
                "price": membership['price_per_month'],
                "offers": [o.strip() for o in offers if o.strip()]
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/user/<user_id>/checkin', methods=['POST'])
def user_checkin(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    today = date.today()
    now = datetime.now().time().strftime('%H:%M:%S')

    try:
        # Check if they have an open session today
        cursor.execute("""
            SELECT id FROM attendance 
            WHERE user_id = %s AND log_date = %s AND time_out IS NULL 
            ORDER BY id DESC LIMIT 1
        """, (user_id, today))
        open_session = cursor.fetchone()

        if open_session:
            # Check out
            cursor.execute("UPDATE attendance SET time_out = %s WHERE id = %s", (now, open_session['id']))
            message = "Checked out successfully"
        else:
            # Check in
            cursor.execute("INSERT INTO attendance (user_id, log_date, time_in) VALUES (%s, %s, %s)", (user_id, today, now))
            message = "Checked in successfully"
            
        db.commit()
        return jsonify({"success": True, "message": message})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/user/<user_id>/history', methods=['GET'])
def user_history(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT log_date, time_in, time_out 
            FROM attendance 
            WHERE user_id = %s 
            ORDER BY log_date DESC, time_in ASC
        """, (user_id,))
        records = cursor.fetchall()
        
        # Format for JSON
        for r in records:
            r['log_date'] = r['log_date'].strftime('%Y-%m-%d')
            r['time_in'] = str(r['time_in'])
            r['time_out'] = str(r['time_out']) if r['time_out'] else None

        return jsonify({"success": True, "history": records})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/user/<user_id>/renew', methods=['POST'])
def user_renew(user_id):
    db = get_db()
    cursor = db.cursor()
    data = request.json
    try:
        total_days = int(data['duration']) * 30
        cursor.execute("""
            INSERT INTO memberships (user_id, package_id, start_date, total_days) 
            VALUES (%s, %s, %s, %s)
        """, (user_id, data['packageId'], date.today(), total_days))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/admin/packages/<pkg_id>', methods=['PUT', 'DELETE'])
def edit_or_delete_package(pkg_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Protect the core packages
    core_packages = ['basic', 'standard', 'premium']

    try:
        if request.method == 'DELETE':
            if pkg_id in core_packages:
                return jsonify({"success": False, "message": "Cannot remove core packages (Basic, Standard, Premium)."}), 403
            
            # SOFT DELETE: Hides the package without breaking active memberships
            cursor.execute("UPDATE packages SET is_active = FALSE WHERE id = %s", (pkg_id,))
            db.commit()
            return jsonify({"success": True, "message": "Package removed successfully."})

        if request.method == 'PUT':
            data = request.json
            cursor.execute(
                "UPDATE packages SET name = %s, price_per_month = %s, offers = %s WHERE id = %s",
                (data['name'], data['price'], data['offers'], pkg_id)
            )
            db.commit()
            return jsonify({"success": True, "message": "Package updated successfully."})
            
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

# Run the server
if __name__ == '__main__':
    app.run(debug=True, port=5000)