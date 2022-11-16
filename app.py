from flask import Flask, jsonify, render_template, request
from logic import automata_pila


app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/validate", methods=["POST"])
def validate():

    word = request.form['word']

    try:
        result = []
        for i in automata_pila.read_input_stepwise(word):            
            result.append(list(i))
    except Exception as e:
        pass
    finally:
        return jsonify(result)

if __name__ == '__main__':
    app.run()