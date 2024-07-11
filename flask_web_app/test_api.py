from flask import Flask, request, jsonify
from pymongo.server_api import ServerApi
from pymongo.mongo_client import MongoClient
from pymongo import collection
from bson import ObjectId
from urllib.parse import quote_plus

uri = "mongodb+srv://arvind19rajan:Venu2002@test1.zs9ohef.mongodb.net/?retryWrites=true&w=majority"
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
admin_collection=db["administrative_data"]
immune_collection=db["Immunisation_details"]
medication_collection=db["Medications"]
diagnosis_collection=db["Diagnosis"]
history_collection=db["Medical_Histories"]
vitals_collection=db["Vitals"]
hospital_collection=db["Hospital"]
doctors_collection=db["Doctors"]

app = Flask(__name__)

# GET method to retrieve all patients
@app.route('/patients', methods=['GET'])
def get_patients():
    items = list(patient_collection.find())
    for item in items:
        item['_id'] = str(item['_id'])
    return jsonify({'items': items})

# GET method to retrieve patient details by patient_id
@app.route('/patients/<patient_id>', methods=['GET'])
def get_patient_by_id(patient_id):
    item = patient_collection.find_one({'patient_id': patient_id})
    if item:
        item['_id'] = str(item['_id'])
        return jsonify({'item': item})
    else:
        return jsonify({'message': 'Patient not found'})

# POST method to add a new patient
@app.route('/patients', methods=['POST'])
def add_item():
    data = request.json
    emergency_contact_info = data.get('Emergency_Contact_info', {})
    emergency_contact_name = emergency_contact_info.get('Name')
    emergency_contact_phone = emergency_contact_info.get('Phone_Number')

    new_item = {
        'patient_id': data['patient_id'],
        'Name': data['Name'],
        'DOB': data['DOB'],
        'Phone_number': data['Phone_number'],
        'Gender': data['Gender'],
        'Ethinicity': data['Ethinicity'],
        'Language': data['Language'],
        'Marital_Status': data['Marital_Status'],
        'Emergency_Contact_info': {
            'Name': emergency_contact_name,
            'Phone_Number': emergency_contact_phone
        }
    }
    result = patient_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

# PUT method to update an existing patient
@app.route('/patients/<patient_id>', methods=['PUT'])
def update_item(patient_id):
    data = request.json
    emergency_contact_info = data.get('Emergency_Contact_info', {})
    emergency_contact_name = emergency_contact_info.get('Name')
    emergency_contact_phone = emergency_contact_info.get('Phone_Number')

    updated_item = {
        'patient_id': data['patient_id'],
        'Name': data['Name'],
        'DOB': data['DOB'],
        'Phone_number': data['Phone_number'],
        'Gender': data['Gender'],
        'Ethinicity': data['Ethinicity'],
        'Language': data['Language'],
        'Marital_Status': data['Marital_Status'],
        'Emergency_Contact_info': {
            'Name': emergency_contact_name,
            'Phone_Number': emergency_contact_phone
        }
    }
    collection.update_one({'patient_id': patient_id}, {'$set': updated_item})
    return jsonify({'message': 'Item updated successfully'})

# DELETE method to remove a patient
@app.route('/patients/<patient_id>', methods=['DELETE'])
def delete_item(patient_id):
    patient_collection.delete_one({'patient_id': patient_id})
    return jsonify({'message': 'Item deleted successfully'})

#GET method to retrieve allergy of a patient using patient_id
@app.route('/allergies/<patient_id>',methods=['GET'])
def get_allergies():
    allergies = list(allergy_collection.find({'patient_id': patient_id}))
    for allergy in allergies:
        allergy['_id'] = str(allergy['_id'])
    return jsonify({'allergies': allergies})

#Add an allergy entry
@app.route('/allergies',methods=['POST'])
def add_allergy():
    data = request.json
    new_item ={
        'patient_id':data['patient_id'],
        'allergen':data['allergen'],
        'Reaction':data['Reaction'],
        'Severity':data['Severity'],
        'Date_of_diagnosis':data['Date_of_diagnosis']
        }
    result = allergy_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

#GET method to retrieve Insurance details of a patient using patient_id
@app.route('/insurance/<patient_id>',methods=['GET'])
def get_insurance():
    insurance = insurance_collection.find({'patient_id': patient_id})
    for i in insurance:
        i['_id'] = str(i['_id'])
    return jsonify({'insurance': insurance})

#GET method to retrieve administrative data of a patient using patient_id
@app.route('/admin/<patient_id>',methods=['GET'])
def get_admin():
    admin = list(admin_collection.find({'patient_id': patient_id}))
    for ad in admin:
        ad['_id'] = str(ad['_id'])
    return jsonify({'admin': admin})

#Add an administrative data entry
@app.route('/admin',methods=['POST'])
def add_admin():
    data = request.json
    new_item ={
        'patient_id':data['patient_id'],
        'Date':data['Date'],
        'Reason':data['Reason'],
        'Type':data['Type'],
        'Amount_paid':data['Amount_paid']
        }
    result = admin_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

#GET method to retrieve immunization data of a patient using patient_id
@app.route('/immune/<patient_id>',methods=['GET'])
def get_immune():
    immune = list(immune_collection.find({'patient_id': patient_id}))
    for im in immune:
        im['_id'] = str(im['_id'])
    return jsonify({'immune': immune})

#Add an immunization data entry
@app.route('/immune',methods=['POST'])
def add_immune():
    data = request.json
    new_item ={
        'patient_id':data['patient_id'],
        'Vaccine_name':data['Vaccine_name'],
        'Administration_date':data['Administration_date'],
        }
    result = immune_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

#GET method to retrieve Medication data of a patient using patient_id
@app.route('/medic/<patient_id>',methods=['GET'])
def get_medic():
    medic = list(medication_collection.find({'patient_id': patient_id}))
    for m in medic:
        m['_id'] = str(m['_id'])
    return jsonify({'medic': medic})

#Add a Medication data entry
@app.route('/medic',methods=['POST'])
def add_medic():
    data = request.json
    new_item ={
        'patient_id':data['patient_id'],
        'M_Name':data['M_Name'],
        'Dosage':data['Dosage'],
        'Route':data['Route'],
        'M_Reason':data['M_Reason']
        }
    result = medication_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})


#GET method to retrieve Diagnosis data of a patient using patient_id
@app.route('/diagnosis/<patient_id>',methods=['GET'])
def get_diagnosis():
    diagnosis = list(diagnosis_collection.find({'patient_id': patient_id}))
    for d in diagnosis:
        d['_id'] = str(d['_id'])
    return jsonify({'diagnosis': diagnosis})

#Add a Diagnosis data entry
@app.route('/diagnosis',methods=['POST'])
def add_diagnosis():
    data = request.json
    new_item ={
        'patient_id':data['patient_id'],
        'Date_of_Diagnosis':data['Date_of_Diagnosis'],
        'Primary_Diagnosis':data['Primary_Diagnosis'],
        }
    result = diagnosis_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

#GET method to retrieve Vital Signs data of a patient using patient_id
@app.route('/Vitals/<patient_id>',methods=['GET'])
def get_vitals():
    vitals = vitals_collection.find({'patient_id': patient_id})
    if vitals:
        vitals['_id'] = str(vitals['_id'])
        return jsonify({'vitals': vitals})
    else:
        return jsonify({'message': 'Patient not found'})

#Add a Vital Signs data entry
@app.route('/vitals',methods=['POST'])
def add_vitals():
    data = request.json
    new_item ={
        "Patient_id":data['Patient_id'],
        "Temperature":data['Temperature'],
        "Heart_Rate":data['Heart_Rate'],
        "Respiration_Rate":data['Respiration_Rate'],
        "Blood_Pressure":data['Blood_Pressure'],
        "SPO2":data['SPO2'],
        "Blood_Glucose":data['Blood_Glucose']
        }
    result = vitals_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

# GET method to retrieve all hospitals
@app.route('/hospitals', methods=['GET'])
def get_hospitals():
    hospitals = list(hospital_collection.find())
    for hospital in hospitals:
        hospital['_id'] = str(hospital['_id'])
    return jsonify({'hospitals': hospitals})

#Add a Hospital data entry
@app.route('/hospitals',methods=['POST'])
def add_hospitals():
    data = request.json
    new_item ={
        "Hospital_id":data['Hospital_id'],
        "Hospital_name":data['Hospital_name'],
        }
    result = hospital_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

#GET method to retrieve data of a doctor using Doctor_id
@app.route('/doctors/<Doctor_id>',methods=['GET'])
def get_doctor():
    Doctors = doctors_collection.find({'Doctor_id': Doctor_id})
    if Doctors:
        Doctors['_id'] = str(Doctors['_id'])
        return jsonify({'Doctors': Doctors})
    else:
        return jsonify({'message': 'Patient not found'})

#Add a Doctors data entry
@app.route('/doctors',methods=['POST'])
def add_doctor():
    data = request.json
    new_item ={
        "Doctor_id":data['Doctor_id'],
        "Hospital_id":data['Hospital_id'],
        "Doctor_Name":data['Doctor_Name'],
        "Specialization":data['Specialization'],
        }
    result = doctors_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})

#GET method to retrievemedical history of a patient using Patient_id
@app.route('/history/<patient_id>',methods=['GET'])
def get_history():
    history = list(history_collection.find({'Doctor_id': Doctor_id}))
    for h in history:
        h['_id'] = str(h['_id'])
    return jsonify({'history': history})


#Add a medical history data entry
@app.route('/history',methods=['POST'])
def add_history():
    data = request.json
    new_item ={
        "Patient_id":data['Patient_id'],
        "Hospital_id":data['Hospital_id'],
        "Doctor_Name":data['Doctor_Name'],
        "Specialization":data['Specialization'],
        }
    result = history_collection.insert_one(new_item)
    return jsonify({'message': 'Item added successfully', 'id': str(result.inserted_id)})



if __name__ == '__main__':
    app.run(debug=True)