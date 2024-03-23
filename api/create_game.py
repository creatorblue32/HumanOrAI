from http.server import BaseHTTPRequestHandler
import json
import firebase_admin
import random
from firebase_admin import credentials
from firebase_admin import db
import os


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Fetch the service account key JSON file contents
        private_key = os.environ.get('PRIVATE_KEY').replace('\\n', '\n')

        credential_dict = {
            "type": os.environ.get('TYPE'),
            "project_id": os.environ.get('PROJECT_ID'),
            "private_key_id": os.environ.get('PRIVATE_KEY_ID'),
            "private_key": private_key,
            "client_email": os.environ.get('CLIENT_EMAIL'),
            "client_id": os.environ.get('CLIENT_ID'),
            "auth_uri": os.environ.get('AUTH_URI'),
            "token_uri": os.environ.get('TOKEN_URI'),
            "auth_provider_x509_cert_url": os.environ.get('AUTH_PROVIDER_X509_CERT_URL'),
            "client_x509_cert_url": os.environ.get('CLIENT_X509_CERT_URL')
        }

        cred = credentials.Certificate(credential_dict)

        # Initialize the Firebase app
        firebase_app = firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://convo-ea70a-default-rtdb.firebaseio.com'
        })


        #Get Game Index
        gameIndexRef = db.reference('/gameIndex')
        gameIndex = gameIndexRef.get()

        #Generate unique game_id
        game_id = random.randint(1000,9999)
        
        if gameIndex and isinstance(gameIndex, dict):
            tryCount = 0
            while((game_id in gameIndex.keys()) and tryCount < 9999):
                print("Re-choosing Game ID")
                game_id = random.randint(1000,9999)
                tryCount+=1
            if tryCount == 10000:
                raise IOError("No space for new games.") 
        else:
            game_id = random.randint(1000,9999)

        gameIndexRef.child(str(game_id)).set("")

        blank_game = {"status": "open", "unassigned_users": "", "groups":"", "model":""}

        games = db.reference('/games/'+str(game_id))
        games.set(blank_game)

        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()
        message = json.dumps({'gameId': '{game_id}'})
        self.wfile.write(message.encode())
