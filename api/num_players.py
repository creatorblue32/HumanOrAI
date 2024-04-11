from http.server import BaseHTTPRequestHandler
import json
import firebase_admin
import random
from firebase_admin import credentials
from firebase_admin import db
import os
from urllib import parse



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
        parsed_path = parse.urlparse(self.path)
        query_params = parse.parse_qs(parsed_path.query)


        cred = credentials.Certificate(credential_dict)

        if not firebase_admin._apps:
        # Initialize the Firebase app
            firebase_app = firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://convo-ea70a-default-rtdb.firebaseio.com'
        })        
        else:
            firebase_app = firebase_admin.get_app()



        gameId = query_params.get('gameId', [''])[0]
        #Get Game Index
        gameIndexRef = db.reference('/games/'+gameId+"/unassigned_users")
        unassignedUsers = gameIndexRef.get()

        if unassignedUsers == "":
            num_players = 0
        else:
            num_players = len(unassignedUsers.keys())

        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()
        message = json.dumps({'num_players': str(num_players)})
        self.wfile.write(message.encode())
