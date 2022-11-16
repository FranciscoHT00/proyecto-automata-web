from flask import Flask, jsonify, render_template, request
from logic import automata_pila


app = Flask(__name__)

@app.route("/")
@app.route("/index.html")
def index():
    return render_template("index.html")

@app.route("/index_en.html")
def index_en():
    return render_template("index_en.html")

@app.route("/index_pt.html")
def index_pt():
    return render_template("index_pt.html")
    

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