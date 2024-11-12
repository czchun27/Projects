from model.Vaccine import Vaccine
from model.Caregiver import Caregiver
from model.Patient import Patient
from util.Util import Util
from db.ConnectionManager import ConnectionManager
import pymssql
import datetime


'''
objects to keep track of the currently logged-in user
Note: it is always true that at most one of currentCaregiver and currentPatient is not null
        since only one user can be logged-in at a time
'''
current_patient = None

current_caregiver = None

# Added (REQUIRED)
def create_patient(tokens):
    # create_patient <username> <password>
    # check 1: the length for tokens need to be exactly 3 to include all information (with the operation name)
    if len(tokens) != 3:
        print("Create patient failed")
        return

    username = tokens[1]
    password = tokens[2]

    # check 2: check if the username has been taken already
    if username_exists_patient(username):
        print("Username taken, try again")
        return
    
    # EXTRA CREDIT PASSWORD STRENGTH
    if (not password_check(password)):
        return

    salt = Util.generate_salt()
    hash = Util.generate_hash(password, salt)

    # create the patient
    patient = Patient(username, salt=salt, hash=hash)

    # save to patient information to our database
    try:
        patient.save_to_db()
    except pymssql.Error as e:
        print("Create patient failed")
        #print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Create patient failed")
        #print(e)
        return
    print("Created user", username)

# Added (HELPER)
def username_exists_patient(username):
    cm = ConnectionManager()
    conn = cm.create_connection()

    select_username = "SELECT * FROM Patients WHERE PUsername = %s"
    try:
        cursor = conn.cursor(as_dict=True)
        cursor.execute(select_username, username)
        #  returns false if the cursor is not before the first record or if there are no rows in the ResultSet.
        for row in cursor:
            return row['PUsername'] is not None
    except pymssql.Error as e:
        print("Create patient failed")
        #print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Create patient failed")
        #print("Error:", e)
    finally:
        cm.close_connection()
    return False


def create_caregiver(tokens):
    # create_caregiver <username> <password>
    # check 1: the length for tokens need to be exactly 3 to include all information (with the operation name)
    if len(tokens) != 3:
        print("Failed to create user.")
        return

    username = tokens[1]
    password = tokens[2]
    # check 2: check if the username has been taken already
    if username_exists_caregiver(username):
        print("Username taken, try again!")
        return
    
    # EXTRA CREDIT PASSWORD STRENGTH
    if (not password_check(password)):
        return

    salt = Util.generate_salt()
    hash = Util.generate_hash(password, salt)

    # create the caregiver
    caregiver = Caregiver(username, salt=salt, hash=hash)

    # save to caregiver information to our database
    try:
        caregiver.save_to_db()
    except pymssql.Error as e:
        print("Failed to create user.")
        print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Failed to create user.")
        print(e)
        return
    print("Created user ", username)


def username_exists_caregiver(username):
    cm = ConnectionManager()
    conn = cm.create_connection()

    select_username = "SELECT * FROM Caregivers WHERE Username = %s"
    try:
        cursor = conn.cursor(as_dict=True)
        cursor.execute(select_username, username)
        #  returns false if the cursor is not before the first record or if there are no rows in the ResultSet.
        for row in cursor:
            return row['Username'] is not None
    except pymssql.Error as e:
        print("Error occurred when checking username")
        print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Error occurred when checking username")
        print("Error:", e)
    finally:
        cm.close_connection()
    return False


# Added (EXTRA CREDIT)
def password_check(password):
    passSplit = []
    passSplit[:] = password
    result = True
    if (len(passSplit) < 8):
        print("Password should be at least 8 characters")
        result = False
    if (password.isupper() or password.islower()):
        print("Password should contain upper and lowercase letters")
        result = False
    hasNum = 0
    hasSpecial = 0
    for char in passSplit:
        if char == "!" or char == "@" or char == "#" or char == "?":
            hasSpecial = 1
        if char.isdigit():
            hasNum = 1
    if hasNum == 0:
        print("Password should contain a number")
        result = False
    if hasSpecial == 0:
        print("Password should contain a special character (!, @, #, ?)")
        result = False
    return result


# Added (REQUIRED)
def login_patient(tokens):
    # login_patient <username> <password>
    # check 1: if someone's already logged-in, they need to log out first
    global current_patient
    if current_caregiver is not None or current_patient is not None:
        print("User already logged in, try again")
        return

    # check 2: the length for tokens need to be exactly 3 to include all information (with the operation name)
    if len(tokens) != 3:
        print("Login patient failed")
        return

    username = tokens[1]
    password = tokens[2]

    patient = None
    try:
        patient = Patient(username, password=password).get()
    except pymssql.Error as e:
        print("Login patient failed")
        # print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Login patient failed")
        # print("Error:", e)
        return
    
    # check if the login was successful
    if patient is None:
        print("Login patient failed")
    else:
        print("Logged in as " + username)
        current_patient = patient


def login_caregiver(tokens):
    # login_caregiver <username> <password>
    # check 1: if someone's already logged-in, they need to log out first
    global current_caregiver
    if current_caregiver is not None or current_patient is not None:
        print("User already logged in.")
        return

    # check 2: the length for tokens need to be exactly 3 to include all information (with the operation name)
    if len(tokens) != 3:
        print("Login failed.")
        return

    username = tokens[1]
    password = tokens[2]

    caregiver = None
    try:
        caregiver = Caregiver(username, password=password).get()
    except pymssql.Error as e:
        print("Login failed.")
        print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Login failed.")
        print("Error:", e)
        return

    # check if the login was successful
    if caregiver is None:
        print("Login failed.")
    else:
        print("Logged in as: " + username)
        current_caregiver = caregiver

# Added (REQUIRED)
def search_caregiver_schedule(tokens):
    if current_caregiver is None and current_patient is None:
        print("Please login first")
        return
    
    if len(tokens) != 2:
        print("Please try again")
        return

    date = tokens[1]
    avail = get_availability(date)
    vacc = get_vaccines()
    for row in avail:
        print(row['Username'])

    for row in vacc:
        print(row['Name'], row['Doses'])

# Added (HELPER)
def get_availability(date):
    cm = ConnectionManager()
    conn = cm.create_connection()

    select_availability = "SELECT Username FROM Availabilities WHERE Time = %s ORDER BY Username"
    try:
        cursor = conn.cursor(as_dict=True)
        cursor.execute(select_availability, date)
        return list(cursor)
        #for row in cursor:
            #print(row['Username'])
    except pymssql.Error as e:
        print("Error occurred when checking availability")
        print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Error occurred when checking availability")
        print("Error:", e)
    finally:
        cm.close_connection()
    return []


# Added (HELPER)
def get_vaccines():
    cm = ConnectionManager()
    conn = cm.create_connection()

    select_vaccines = "SELECT Name, Doses FROM Vaccines ORDER BY Name"
    try:
        cursor = conn.cursor(as_dict=True)
        cursor.execute(select_vaccines)
        return list(cursor)
        #for row in cursor:
            #print(row['Name'], row['Doses'])
    except pymssql.Error as e:
        print("Error occurred when checking vaccines")
        print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Error occurred when checking vaccines")
        print("Error:", e)
    finally:
        cm.close_connection()
    return []


# Added (REQUIRED)
def reserve(tokens):
    global current_patient
    if current_caregiver is not None:
        print("Please login as a patient")
        return
    
    if current_patient is None:
        print("Please login first")
        return
    
    if len(tokens) != 3:
        print("Please try again")
        return
    
    date = tokens[1]
    vaccine = tokens[2]

    caregivers = get_availability(date)
    vacc = get_vaccines()
    vacc_found = 0

    if (len(caregivers) == 0):
        print("No caregiver is available")
        return

    for row in vacc:
        if row["Name"] == vaccine:
            vacc_found = 1
            if row["Doses"] == 0:
                print("Not enough available doses")
                return

    # Vaccine not found = not enough doses?
    if (vacc_found == 0):
        print("Not enough available doses")
        return

    date_tokens = date.split("-")
    month = int(date_tokens[0])
    day = int(date_tokens[1])
    year = int(date_tokens[2])
    try:
        d = datetime.datetime(year, month, day)
        current_patient.make_appointment(caregivers, d, vaccine)
    except pymssql.Error as e:
        print("Please try again")
        print("Db-Error:", e)
        quit()
    except ValueError:
        # Bad date
        print("Please try again")
        return
    except Exception as e:
        print("Please try again")
        print("Error:", e)
        return


def upload_availability(tokens):
    #  upload_availability <date>
    #  check 1: check if the current logged-in user is a caregiver
    global current_caregiver
    if current_caregiver is None:
        print("Please login as a caregiver first!")
        return

    # check 2: the length for tokens need to be exactly 2 to include all information (with the operation name)
    if len(tokens) != 2:
        print("Please try again!")
        return

    date = tokens[1]
    # assume input is hyphenated in the format mm-dd-yyyy
    date_tokens = date.split("-")
    month = int(date_tokens[0])
    day = int(date_tokens[1])
    year = int(date_tokens[2])
    try:
        d = datetime.datetime(year, month, day)
        current_caregiver.upload_availability(d)
    except pymssql.Error as e:
        print("Upload Availability Failed")
        print("Db-Error:", e)
        quit()
    except ValueError:
        print("Please enter a valid date!")
        return
    except Exception as e:
        print("Error occurred when uploading availability")
        print("Error:", e)
        return
    print("Availability uploaded!")


# Added (EXTRA CREDIT)
def cancel(tokens):
    if (current_caregiver is None and current_patient is None):
        print("Please login first")
        return

    if len(tokens) != 2:
        print("Please try again!")
        return

    app_id = tokens[1]

    cm = ConnectionManager()
    conn = cm.create_connection()
    cursor = conn.cursor(as_dict=True)

    select_app = "SELECT * FROM Appointments WHERE AppId = %s"
    remove_appointment = "DELETE FROM Appointments WHERE AppId = %s"
    add_availability = "INSERT INTO Availabilities VALUES (%s, %s)"
    add_stock = "UPDATE Vaccines SET Doses = Doses+1 WHERE Name = %s"
    try:
        cursor.execute(select_app, (app_id))
        results = list(cursor)
        if (len(results) == 0):
            print("Appointment not found")
        else:
            caregiver = results[0]["Username"]
            d = results[0]["Time"]
            v = results[0]["Name"]
            cursor.execute(remove_appointment, (app_id))
            cursor.execute(add_availability, (d, caregiver))
            cursor.execute(add_stock, (v))
            print("Canceled Appointment ID", str(app_id))
        # you must call commit() to persist your data if you don't set autocommit to True
        conn.commit()
    except pymssql.Error:
        # print("Error occurred when updating caregiver availability")
        raise
    finally:
        cm.close_connection()
    


def add_doses(tokens):
    #  add_doses <vaccine> <number>
    #  check 1: check if the current logged-in user is a caregiver
    global current_caregiver
    if current_caregiver is None:
        print("Please login as a caregiver first!")
        return

    #  check 2: the length for tokens need to be exactly 3 to include all information (with the operation name)
    if len(tokens) != 3:
        print("Please try again!")
        return

    vaccine_name = tokens[1]
    doses = int(tokens[2])
    vaccine = None
    try:
        vaccine = Vaccine(vaccine_name, doses).get()
    except pymssql.Error as e:
        print("Error occurred when adding doses")
        print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Error occurred when adding doses")
        print("Error:", e)
        return

    # if the vaccine is not found in the database, add a new (vaccine, doses) entry.
    # else, update the existing entry by adding the new doses
    if vaccine is None:
        vaccine = Vaccine(vaccine_name, doses)
        try:
            vaccine.save_to_db()
        except pymssql.Error as e:
            print("Error occurred when adding doses")
            print("Db-Error:", e)
            quit()
        except Exception as e:
            print("Error occurred when adding doses")
            print("Error:", e)
            return
    else:
        # if the vaccine is not null, meaning that the vaccine already exists in our table
        try:
            vaccine.increase_available_doses(doses)
        except pymssql.Error as e:
            print("Error occurred when adding doses")
            print("Db-Error:", e)
            quit()
        except Exception as e:
            print("Error occurred when adding doses")
            print("Error:", e)
            return
    print("Doses updated!")


# Added (REQUIRED)
def show_appointments(tokens):
    if (current_caregiver is None and current_patient is None):
        print("Please login first")

    if (current_caregiver is None and current_patient is not None):
        print_appointments(0)

    if (current_caregiver is not None and current_patient is None):
        print_appointments(1)


# Added (HELPER)
def print_appointments(userType):
    cm = ConnectionManager()
    conn = cm.create_connection()
    select_appointments = ""
    name = ""
    user = ""
    if (userType == 0):
        select_appointments = "SELECT * FROM Appointments WHERE PUsername = %s ORDER BY AppID"
        name = current_patient.username
        user = "Username"
    
    if (userType == 1):
        select_appointments = "SELECT * FROM Appointments WHERE Username = %s ORDER BY AppID"
        name = current_caregiver.username
        user = "PUsername"
    
    try:
        cursor = conn.cursor(as_dict=True)
        cursor.execute(select_appointments, name)
        for row in cursor:
            month = ""
            day = ""
            if (row['Time'].month < 10):
                month = "0"
            if (row['Time'].day < 10):
                day = "0"
            time = month + str(row['Time'].month) + "-" + day + str(row['Time'].day) + "-" + str(row['Time'].year)
            print(row['AppId'], row['Name'], time, row[user])
    except pymssql.Error as e:
        print("Error occurred when checking vaccines")
        print("Db-Error:", e)
        quit()
    except Exception as e:
        print("Error occurred when checking vaccines")
        print("Error:", e)
    finally:
        cm.close_connection()


# Added (REQUIRED)
def logout(tokens):
    global current_patient
    global current_caregiver
    if (current_caregiver is None and current_patient is None):
        print("Please login first")

    current_caregiver = None
    current_patient = None
    print("Successfully logged out")


# EDITED FOR EXTRA CREDIT PASSWORDS
def start():
    stop = False
    print()
    print(" *** Please enter one of the following commands *** ")
    print("> create_patient <username> <password>")  # //TODO: implement create_patient (Part 1)
    print("> create_caregiver <username> <password>")
    print("> login_patient <username> <password>")  # // TODO: implement login_patient (Part 1)
    print("> login_caregiver <username> <password>")
    print("> search_caregiver_schedule <date>")  # // TODO: implement search_caregiver_schedule (Part 2)
    print("> reserve <date> <vaccine>")  # // TODO: implement reserve (Part 2)
    print("> upload_availability <date>")
    print("> cancel <appointment_id>")  # // TODO: implement cancel (extra credit)
    print("> add_doses <vaccine> <number>")
    print("> show_appointments")  # // TODO: implement show_appointments (Part 2)
    print("> logout")  # // TODO: implement logout (Part 2)
    print("> Quit")
    print()
    while not stop:
        response = ""
        print("> ", end='')

        try:
            response = str(input())
        except ValueError:
            print("Please try again!")
            break

        tokensRaw = response.split(" ")
        response = response.lower()
        tokens = response.split(" ")
        
        if len(tokens) == 0:
            ValueError("Please try again!")
            continue
        operation = tokens[0]
        if operation == "create_patient":
            create_patient(tokensRaw)
        elif operation == "create_caregiver":
            create_caregiver(tokensRaw)
        elif operation == "login_patient":
            login_patient(tokensRaw)
        elif operation == "login_caregiver":
            login_caregiver(tokensRaw)
        elif operation == "search_caregiver_schedule":
            search_caregiver_schedule(tokens)
        elif operation == "reserve":
            reserve(tokens)
        elif operation == "upload_availability":
            upload_availability(tokens)
        elif operation == cancel:
            cancel(tokens)
        elif operation == "add_doses":
            add_doses(tokens)
        elif operation == "show_appointments":
            show_appointments(tokens)
        elif operation == "logout":
            logout(tokens)
        elif operation == "cancel":
            cancel(tokens)
        elif operation == "quit":
            print("Bye!")
            stop = True
        else:
            print("Invalid operation name!")


if __name__ == "__main__":
    '''
    // pre-define the three types of authorized vaccines
    // note: it's a poor practice to hard-code these values, but we will do this ]
    // for the simplicity of this assignment
    // and then construct a map of vaccineName -> vaccineObject
    '''

    # start command line
    print()
    print("Welcome to the COVID-19 Vaccine Reservation Scheduling Application!")

    start()
