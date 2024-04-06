from http.server import BaseHTTPRequestHandler
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import os
from urllib import parse
import requests
import openai

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        #SETUP
        #GET COMMENTS
        #MAKE PROMPT
        #MAKE CALL
        #INSERT NEW COMMENT
        #HANDLE NEXT
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

        
        success = False

        model = db.reference('/games/'+str(game_id)+"/groups/"+str(group_no)+"/model").get()


        path = f'games/{game_id}/groups/{group_no}/users'
        ref = db.reference(path)
        seqPath = f'games/{game_id}/groups/{group_no}/sequence'
        seqRef = db.reference(seqPath)
        user_ids_string = seqRef.get()
        user_ids = user_ids_string.split(",")
        user_ids.pop()
        ordered_comments = []
        for user_id in user_ids:
            user_ref = ref.child(user_id)
            user_data = user_ref.get()
            comment = user_data.get('comment', '') if user_data else ''
            ordered_comments.append(comment)



        generated_comment = "No Comment"
                
        prompt = "Social Media Post: News Article Text:"
        prompt += "In the spring of 2023, Sunshine Henle found herself grappling with the profound loss of her 72-year-old mother, who succumbed to organ failure the previous Thanksgiving. Amidst her grief, Henle turned to an unconventional source of comfort: artificial intelligence. Leveraging OpenAI's ChatGPT, she crafted a \"ghostbot\" of her mother, infusing it with their shared text messages to simulate conversations that echoed her mother's voice and wisdom. This innovative approach to coping with her loss proved to be a source of solace for Henle, a Florida-based AI trainer accustomed to the potential of technology to mimic human interactions. Henle's experience is situated within the burgeoning landscape of \"grief tech,\" a niche but rapidly expanding field that intersects technology and bereavement support. Startups like Replika, HereAfter AI, StoryFile, and Seance AI are at the forefront of this movement, offering a variety of services designed to help individuals navigate their grief. These platforms employ deep learning and large language models to recreate the essence of lost loved ones, providing interactive video conversations, virtual avatars for texting, and audio legacies that aim to preserve the memory and presence of the deceased. Despite the comfort these technologies offer to those like Henle, they also usher in a host of ethical and psychological dilemmas. Questions about the consent of the deceased, the potential for psychological dependency on digital avatars, and the risks of exacerbating grief through artificial prolongation of relationships are at the heart of the debate. Furthermore, the commercialization of grief, with services ranging from affordable subscriptions to premium packages, raises concerns about the exploitation of vulnerable individuals seeking closure."
        prompt += "Comment Section:"
        
        for index,comment in enumerate(ordered_comments):
            prompt += ("Comment " + str(index) + " Text: " + comment)
        
        new_comment_index = len(ordered_comments)
        new_comment_prompt = "Comment " + str(new_comment_index) + " Text: "
        prompt += new_comment_prompt
        
        def stable_query():
            openai.api_key = os.getenv('OPENAI_API_KEY')
            response = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                                messages=[{"role": "system", "content": ""},
                                                    {"role": "user", "content": prompt}], max_tokens=50)
            return response["choices"][0]["message"]["content"]
        
        def hugging_face_query(url):
            generated_comment = "No Comment Generated"
            api_url = url
            hfapikey = os.getenv('HF_API_KEY')
            headers = {"Authorization": "Bearer "+hfapikey}
            payload = {
                "inputs": prompt,
                "parameters": { 
                    "max_length": 50,
                    "return_full_text": False,
                },
            }
            pre_generated = requests.post(api_url, headers=headers, json=payload).json()
            if pre_generated != list(): #ERROR CASE! will query stable, and log incident in game notes
                print("BACKUP: will query stable API GPT-3.5 ... and LOG. ")
                generated_comment = stable_query()
                path = f'games/{game_id}/groups/{group_no}/users/AI'
                error_log_path = f'games/{game_id}/groups/{group_no}/users/AI/error_log'
                db.reference(error_log_path).set(str(pre_generated))
            else:
                generated_comment = pre_generated[0]['generated_text']
            return generated_comment
            
            

        if model == "GPT-2":
            api_url = "https://api-inference.huggingface.co/models/openai-community/gpt2"
            generated_comment = hugging_face_query(api_url)

        elif model == "LLAMA2":
            api_url = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf"
            generated_comment = hugging_face_query(api_url)
            
        elif model == "GPT-3.5":
            openai.api_key = os.getenv('OPENAI_API_KEY')
            response = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                                messages=[{"role": "system", "content": ""},
                                                    {"role": "user", "content": prompt}], max_tokens=50)
            generated_comment = response["choices"][0]["message"]["content"]
        else:
            generated_comment += model
            
        dbref = db.reference(f"games/{game_id}/groups/{group_no}/users/AI/comment")
        dbref.set(generated_comment)

        #MUST SET NEXT PLAYER TO ACTIVE
        dbseqref = db.reference(f'games/{game_id}/groups/{group_no}/sequence')
        dbseq = dbseqref.get()
        list = dbseq.split(",")
        newIndex = list.index("AI")
        if (newIndex >= len(list)-1):
            stateref = db.reference(f'games/{game_id}/groups/{group_no}/status')
            stateref.set("voting")

        else:
            nextUserId = list[newIndex+1]
            nextUserRef = db.reference(f'games/{game_id}/groups/{group_no}/users/{nextUserId}/state')
            nextUserRef.set("active")


        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()
        message = json.dumps({'prompt response': generated_comment})
        self.wfile.write(message.encode())

                