from http.server import BaseHTTPRequestHandler
import json
import os
from firebase_admin import credentials
from firebase_admin import db
from urllib import parse
import firebase_admin



class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()
        
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

        parsed_path = parse.urlparse(self.path)
        query_params = parse.parse_qs(parsed_path.query)

        game_id = query_params.get('gameId', [''])[0]

        if not firebase_admin._apps:
        # Initialize the Firebase app
            firebase_app = firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://convo-ea70a-default-rtdb.firebaseio.com'
        })        
        else:
            firebase_app = firebase_admin.get_app()

        
        groups_ref = db.reference(f'games/{game_id}/groups')

        game_data = groups_ref.get()

        print(game_data)

        for group_no, group_data in game_data.items():
            # Split the sequence by comma to find the index of "AI"
            sequence_list = group_data['sequence'].split(',')
            try:
                ai_index = sequence_list.index("AI")
                # Update the group data with the 'ai_index'
                dbref = db.reference(f"games/{game_id}/groups/{group_no}/ai_comment_index")
                dbref.set(ai_index)

            except ValueError:
                print(f'"AI" not found in sequence for Group {group_no} in Game ID {game_id}.')

    
        
        message = json.dumps({'message': 'Done!'})
        self.wfile.write(message.encode())
