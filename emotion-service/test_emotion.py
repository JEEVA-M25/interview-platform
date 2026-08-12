import requests
import sys
import time

def test_audio(file_path):
    url = "http://localhost:8001/predict"
    
    try:
        with open(file_path, "rb") as f:
            files = {"file": f}
            print(f"Sending {file_path} to {url}...")
            
            start = time.time()
            response = requests.post(url, files=files)
            end = time.time()
            
            print(f"HTTP Status: {response.status_code}")
            print(f"Time taken: {round(end - start, 3)} seconds")
            
            if response.status_code == 200:
                print("Result:")
                print(response.json())
            else:
                print(f"Error: {response.text}")
                
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_emotion.py <path_to_audio_file>")
    else:
        test_audio(sys.argv[1])
