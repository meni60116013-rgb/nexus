import os
import subprocess
import json

def audit_local():
    data = []
    home = os.path.expanduser("~")
    for root, dirs, files in os.walk(home):
        if ".git" in dirs:
            repo_path = root
            repo_name = os.path.basename(root)
            remote = subprocess.run(["git", "-C", repo_path, "remote", "get-url", "origin"], capture_output=True, text=True).stdout.strip()
            branch = subprocess.run(["git", "-C", repo_path, "branch", "--show-current"], capture_output=True, text=True).stdout.strip()
            status = subprocess.run(["git", "-C", repo_path, "status", "-s"], capture_output=True, text=True).stdout.strip()
            data.append({
                "name": repo_name, 
                "path": repo_path, 
                "remote": remote, 
                "branch": branch, 
                "has_local_changes": bool(status)
            })
            dirs[:] = []
    
    with open("termux_audit_report.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("✅ Reporte local generado con éxito: termux_audit_report.json")

if __name__ == "__main__":
    audit_local()
