from flask import Flask, render_template, jsonify
from flask import request, url_for, redirect
from pymongo.server_api import ServerApi
from pymongo.mongo_client import MongoClient
from pymongo import collection
from bson import ObjectId
from urllib.parse import quote_plus
from twilio.rest import Client
from testfile import dummy_fn 

client=Client('')


uri = ""
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Select your database
db = client["EHR"]

# Select your collection
patient_collection = db["Patient_demographics"]
allergy_collection=db["Allergies"]
insurance_collection=db["Insurance"]
admin_collection=db["Administrative_data"]
immune_collection=db["Immunisation_details"]
medication_collection=db["Medications"]
diagnosis_collection=db["Diagnosis"]
history_collection=db["Medical_Histories"]
vitals_collection=db["Vitals"]
hospital_collection=db["Hospital"]
doctors_collection=db["Doctors"]
login_collection=db["Login"]
sos_collection=db["SOS"]

app = Flask(__name__)



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    result = dummy_fn()  # Calling the function from other_file.py
    print(result)
    return jsonify({'message': 'Success: OTP sent successfully'}), 200

@app.route('/login_verify', methods=['GET','POST'])
def login_verify():
    if request.method == 'POST':
        u_name = request.form['username']
        u_pass = request.form['password']
        otp= str(request.form['otp'])
        active_tab = request.form['active_tab']
        print(u_name)
        query = {
            "Email": u_name,
            "Password": u_pass
        }
        # Assuming patient_collection is your MongoDB collection
        result = login_collection.find_one(query)
        if result and otp=='12345':
            if active_tab == 'nav-home':
                return redirect(url_for('doctor'))
            elif active_tab == 'nav-profile':
                return redirect(url_for('emt'))
            elif active_tab == 'nav-contact':
                return redirect(url_for('patient'))
            elif active_tab == 'nav-hosp':
                return redirect(url_for('hospital'))

        else:
            return "Invalid username or password" 

@app.route('/emt')
def emt():
    return render_template('emt.html')


@app.route('/doctor')
def doctor():
    items = list(patient_collection.find())
    return render_template('doctor.html',items=items)


@app.route('/doctor/patient/<patient_id>')
def patient_medical_record(patient_id):
    item = patient_collection.find_one({'Patient_id': patient_id})
    history = list(history_collection.find({'Patient_id': patient_id}))
    immune = list(immune_collection.find({'Patient_id': patient_id}))
    insurance = insurance_collection.find({'Patient_id': patient_id})
    allergies = list(allergy_collection.find({'Patient_id': patient_id}))
    medic = list(medication_collection.find({'Patient_id': patient_id}))
    diagnosis = list(diagnosis_collection.find({'Patient_id': patient_id}))
    return render_template('pat_record.html',patient=item,history=history,immune=immune,insurance=insurance,allergies=allergies,medic=medic,diagnosis=diagnosis)


@app.route('/hospital')
def hospital():
    return render_template('hospital.html')

@app.route('/hospital/sos')
def sos():
    items= sos_collection.find_one()
    return render_template('sos.html',items=items)

@app.route('/hospital/admits')
def admits():
    items = list(patient_collection.find())
    return render_template('admits.html',items=items)

@app.route('/hospital/doctor_list')
def doctor_list():
    doctors = doctors_collection.find()
    return render_template('doctor_list.html',doctors=doctors)



@app.route('/patient')
def patient():
    return render_template('patient.html')

@app.route('/patient/medical_record/<patient_id>')
def patient_med_record(patient_id):
    item = patient_collection.find_one({'Patient_id': patient_id})
    history = list(history_collection.find({'Patient_id': patient_id}))
    immune = list(immune_collection.find({'Patient_id': patient_id}))
    return render_template('med_record.html',patient=item,history=history,immune=immune)

@app.route('/patient/allergy_meds/<patient_id>')
def patient_allergy_meds(patient_id):
    allergies = list(allergy_collection.find({'Patient_id': patient_id}))
    medic = list(medication_collection.find({'Patient_id': patient_id}))
    return render_template('allergy_meds.html',allergies=allergies,medic=medic)


if __name__ == '__main__':
    import ssl
    ssl_context=ssl.SSLContext(ssl.PROTOCOL_TLS)
    ssl_context.load_cert_chain('cert.pem','key.pem')
    app.run(debug=True,ssl_context=ssl_context)
