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

        success = False

        unassigned_users = db.reference('/games/'+str(game_id)+"/unassigned_users").get()

        db.reference('/games/'+str(game_id)+"/status").set("active")

        if ((not (isinstance(unassigned_users,dict))) or len(unassigned_users.keys())==0):
            success = False
        else:
            unassigned_users = list(unassigned_users.keys())
            
            min_group_size, max_group_size = 5, 7
            num_users = len(unassigned_users)
            optimal_group_size = min_group_size
            smallest_difference = num_users  # Initialize with a high value

            # Find the optimal group size
            for group_size in range(min_group_size, max_group_size + 1):
                remainder = num_users % group_size
                # If no remainder, this group size evenly divides the users
                if remainder == 0:
                    optimal_group_size = group_size
                    break
                # If there's a remainder, check if this is the closest to our target group size
                elif (group_size-remainder) <= smallest_difference:
                    smallest_difference = min(smallest_difference, abs(group_size - remainder))
                    optimal_group_size = group_size


            # Calculate number of groups, adjusting for the final group
            num_groups = num_users // optimal_group_size + (1 if num_users % optimal_group_size else 0)

            # Divide the user_ids into groups
            groups = {}
            for i in range(num_groups):
                start_index = i * optimal_group_size
                end_index = start_index + optimal_group_size
                group_key = f"group{i + 1}"
                groups[group_key] = unassigned_users[start_index:end_index]



            blank_user = {"state": "waiting", "comment": "", "vote":""}

            #Handle Model Assignment
            models = ["LLAMA2","GPT-3.5","MISTRAL","GEMINI", "GPT-2"]
            modelIndex = 0


            #Create Group
            for (groupNo,group) in groups.items():
                #Add Blank User Profiles
                users = dict()

                for user in group:
                    users[user] = blank_user.copy()
                users["AI"] = blank_user.copy()

                sequence = ""

                currentUsers = list(users.keys())

                random.shuffle(currentUsers)
                while(currentUsers[0] == "AI"):
                    random.shuffle(currentUsers)
                
                users[currentUsers[0]]["state"] = "active"
                                
                sequence = ",".join(currentUsers)


                groupFormatted = dict()
                groupFormatted["users"] = users
                groupFormatted["model"] = models[modelIndex]
                groupFormatted["sequence"] = sequence
                groupFormatted["commentsequence"] = ""
                groupFormatted["status"] = "active"
                groupFormatted["ai_comment_index"] = None
                groups[groupNo] = groupFormatted
                modelIndex += 1
                if modelIndex >= len(models):
                    modelIndex = 0
                




            db.reference('games/'+str(game_id)+'/groups').set(groups)
            db.reference('/games/'+str(game_id)+"/unassigned_users").set("")
            success = True
            
        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()
        message = json.dumps({'success': str(success)})
        self.wfile.write(message.encode())
