import socket
import sys
import time
import urllib.request
import urllib.error

def check_port(host, port, service_name):
    print(f"Checking {service_name} on {host}:{port}...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    
    if result == 0:
        print(f"[OK] {service_name} is RUNNING on port {port}.")
        return True
    else:
        print(f"[FAIL] {service_name} is NOT detected on port {port}.")
        return False

def check_http(url, service_name):
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            print(f"[OK] {service_name} responded with {response.getcode()}")
            return True
    except urllib.error.URLError as e:
        print(f"[FAIL] {service_name} is not responding to HTTP requests. Error: {e}")
        return False
    except Exception as e:
         print(f"[WARN] {service_name} error: {e}")
         return False

def main():
    print("--- LMS COMPLETE SYSTEM VERIIFICATION ---")
    
    # Check Backend
    backend_up = check_port('127.0.0.1', 8000, "Django Backend")
    if backend_up:
        check_http('http://127.0.0.1:8000/admin/login/', "Backend Admin")

    print("-" * 30)

    # Check Frontend
    frontend_up = check_port('127.0.0.1', 5173, "Vite Frontend")
    if frontend_up:
        check_http('http://127.0.0.1:5173/', "Frontend UI")

    print("-" * 30)
    
    if backend_up and frontend_up:
        print("[SUCCESS] ALL SYSTEMS ONLINE. Manager can track everything.")
    else:
        print("[WARNING] SYSTEM PARTIALLY OFFLINE.")

if __name__ == "__main__":
    main()
