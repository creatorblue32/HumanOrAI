from http.server import BaseHTTPRequestHandler
import json
import os
from firebase_admin import credentials
import firebase_admin
from urllib import parse
from firebase_admin import db


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
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
        group_no = query_params.get('groupNo', [''])[0]


        #model = query_params.get('model', [''])[0]
        
        if not firebase_admin._apps:
            firebase_app = firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://convo-ea70a-default-rtdb.firebaseio.com'
        })        
        else:
            firebase_app = firebase_admin.get_app()

        
        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()
        message = json.dumps({'message': 'Hello from Python!'})
        self.wfile.write(message.encode())
