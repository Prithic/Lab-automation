import socket
import sys

def check_ssh_port(ip, port=22):
    print(f"Checking SSH port {port} on {ip}...")
    try:
        with socket.create_connection((ip, port), timeout=5):
            print(f"SUCCESS: Port {port} is OPEN on {ip}")
            return True
    except socket.timeout:
        print(f"ERROR: Connection TIMED OUT. The Pi at {ip} might be offline or blocked by a firewall.")
    except ConnectionRefusedError:
        print(f"ERROR: Connection REFUSED. The Pi is online but SSH service might be down.")
    except Exception as e:
        print(f"ERROR: {e}")
    return False

if __name__ == "__main__":
    target_ip = "192.168.137.37"
    check_ssh_port(target_ip)
