from flask import Flask, render_template, jsonify, request, redirect
import json
import random
import string
import datetime

app = Flask(__name__, template_folder='templates',static_folder='static')

@app.route('/', methods=['GET'])
def newCalendar():
    existing = json.load(open("existing.json", "r"))
    randomId = ''.join([random.choice(string.ascii_uppercase+string.digits) for x in range(16)])
    existing[randomId] = {"metadata": {
        "timestamp": str(datetime.datetime.now().timestamp()),
        "title": "exmplae tuitle"
    },
    "groupdata": []}
    json.dump(existing, open("existing.json", "w"))
    return redirect("/"+randomId, code=303)

@app.route('/<string:calendarId>', methods=['GET'])
def existingCalendar(calendarId):
    return render_template("index.html", id=calendarId)

@app.route('/load/<string:calendarId>', methods=['GET'])
def loadExistingCalendar(calendarId):
    calendar = json.load(open("existing.json", "r"))[calendarId]
    return jsonify(calendar)

@app.route('/save/<string:calendarId>', methods=['POST'])
def saveExistingCalendar(calendarId):
    requestJson = {x.split("=")[0]:x.split("=")[1].replace("%3B", ";").replace("%0A", "").replace("+"," ") for x in request.get_data(as_text=True).split("&")}
    calendars = json.load(open("existing.json", "r"))
    calendar = calendars[calendarId]
    print(requestJson)
    if requestJson['method'] == "addTodoBox":
        tempList = calendar["groupdata"]
        tempList.append({"metadata":{"timestamp": str(datetime.datetime.now().timestamp()), "title": requestJson['arg']}, "todos": []})
        calendar["groupdata"] = tempList
        calendars[calendarId] = calendar
        json.dump(calendars, open("existing.json", "w"))
    if requestJson['method'] == "addTodoItem":
        tempBox = calendar["groupdata"][int(requestJson['arg'].split(";")[0])]
        tempBox['todos'].append({"timestamp": str(datetime.datetime.now().timestamp()),
                                "title": requestJson['arg'].split(";")[1],
                                "description": requestJson['arg'].split(";")[2]})
        calendar["groupdata"][int(requestJson['arg'].split(";")[0])] = tempBox
        calendars[calendarId] = calendar
        json.dump(calendars, open("existing.json", "w"))
    if requestJson['method'] == "delTodoBox":
        calendar['groupdata'].pop(int(requestJson['arg']))
        calendars[calendarId] = calendar
        json.dump(calendars, open("existing.json", "w"))
    if requestJson['method'] == "delTodoItem":
        calendar['groupdata'][int(requestJson['arg'].split(";")[0])]['todos'].pop(int(requestJson['arg'].split(";")[1]))
        calendars[calendarId] = calendar
        json.dump(calendars, open("existing.json", "w"))
    return jsonify(calendar)

app.run(debug=True)