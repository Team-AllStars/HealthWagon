from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from base64 import urlsafe_b64encode, urlsafe_b64decode
from pymongo.server_api import ServerApi
from pymongo.mongo_client import MongoClient
import certifi
import os
import base64
uri = "mongodb+srv://arvind19rajan:Venu2002@test1.zs9ohef.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri,tlsCAFile=certifi.where())

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Select your database
db = client["EHR"]

#Select your collection 
emt_collection=db['EMT']

#AES key
key=b'Thats my Kung Fu'

def encrypt_text(key, plaintext):
    iv = b'Thats my Kung Pu'
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(plaintext.encode()) + encryptor.finalize()
    return urlsafe_b64encode(iv + ciphertext).decode()

def decrypt_text(key, ciphertext):
    decoded_ciphertext = urlsafe_b64decode(ciphertext)
    iv = decoded_ciphertext[:16]
    ciphertext = decoded_ciphertext[16:]
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_text = decryptor.update(ciphertext) + decryptor.finalize()
    return decrypted_text

def update_collection_encrypt():
    documents = emt_collection.find({})
    for document in documents:
        emt_id=encrypt_text(key,document['EMT_id'])
        emt_name=encrypt_text(key,document['EMT_Name'])
        emt_phone=encrypt_text(key,document['EMT_Phone'])
        emt_collection.update_one({'_id': document['_id']}, {'$set': {'EMT_id': emt_id,'EMT_Name':emt_name,'EMT_Phone':emt_phone}})
    print("Encryption completed.")

def update_collection_decrypt():
    documents = emt_collection.find({})
    for document in documents:
        emt_id=decrypt_text(key,document['EMT_id']).decode()
        emt_name=decrypt_text(key,document['EMT_Name']).decode()
        emt_phone=decrypt_text(key,document['EMT_Phone']).decode()
        emt_collection.update_one({'_id': document['_id']}, {'$set': {'EMT_id': emt_id,'EMT_Name':emt_name,'EMT_Phone':emt_phone}})
    print("Decryption completed.")

update_collection_decrypt()

#####################

#API Code to retrieve encrypted data

@app.route('/emt_retrieve/<emt_id>')
def retrieve_emt(emt_id):
    emt_id=encrypt(key,emt_id)
    emt_collection=db['EMT']
    emt=emt_collection.find({'EMT_id':emt_id})
    if emt:
        emt['_id'] = str(emt['_id'])
        return jsonify({'emt': emt})
    else:
        return jsonify({'message': 'EMT not found'})

