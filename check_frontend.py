import requests

try:
    response = requests.get("http://localhost:3000")
    if response.status_code == 200:
        print("Frontend is accessible")
    else:
        print(f"Frontend returned status code {response.status_code}")
except Exception as e:
    print(f"Error accessing frontend: {e}")