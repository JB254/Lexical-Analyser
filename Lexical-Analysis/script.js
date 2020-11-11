var textArea = document.querySelector("#source-program")
var button = document.querySelector("#analyse-btn")
var display = document.querySelector("#result")
var table = document.querySelector("#table-data")

button.addEventListener("click", (e)=>{
	let inputString = textArea.value.replace(/[\n\r]/g, ' ').replace(/[\t]/g, ' ')
	const tokens = tokenize(inputString);
	const dataset = analyse(tokens);

	renderTable(dataset);
	var {labels, values} = filterBy(dataset, "group");
	plotChart(labels, values);
	display.innerHTML = tokens.length + " tokens found.";
})

function tokenize(inputString){
	const characters = inputString.split("");
	var tokens = [];
	let lexeme = '';

	const whitespace = " ";
	const separators = getSeparators();
	const operators = getOperators();

	characters.forEach((character,i) => {
	    if(character != whitespace){
			//terminator
			if(separators.indexOf(character) >= 0 || operators.indexOf(character) >= 0){
				if(lexeme != ""){
					tokens.push(lexeme);
				}
				tokens.push(character);
			    lexeme = '';
			}
			else{
			    lexeme += character;					
			}	
		}
		else if(character == whitespace){
			if(lexeme != ""){
				tokens.push(lexeme);
			}
		    lexeme = '';
		}
	});
	// console.log(tokens)
	return tokens;	
}

function analyse(tokens){
	const tokenAnalysis = []
	//classes
	const keywords = getKeywords();
	const separators = getSeparators();
	const operators = getOperators();
	tokens.forEach((token,i) => {
		const term = {}
		term.position = (i+1);
		//scan keywords
		if(keywords.indexOf(token) >= 0){
			term.value = token
			term.group = "keyword"
		}
		//scan separators
		else if(separators.indexOf(token) >= 0){
			term.value = token
			term.group = "separator"
		}
		//scan operators
		else if(operators.indexOf(token) >= 0){
			term.value = token
			term.group = "operator"
		}
		//scan constants
		else if(!isNaN(token)){
			term.value = token
			term.group = "constant"
		}
		//scan identifier
		else{
			term.value = token
			term.group = "identifier"			
		}
		tokenAnalysis.push(term)
	});
	// console.log(tokenAnalysis)
	return tokenAnalysis
}

function filterBy(collection, property) {
    const labels = collection.map((term) => {
    	return term[property];
    }).filter((value, index, self) => { 
	    return self.indexOf(value) === index;
	})

    const values = [];
    labels.forEach((label) => {
    	values.push(collection.filter((item) => {
    		return item[property] == label
    	}).length)
    });

    return {labels, values};
}

function plotChart(labels, values) {

	const layout = {
		autosize: false,
		width: 500,
		height: 300,
		margin: {
		l: 50,
		r: 50,
		b: 50,
		t: 50,
		pad: 4
		}
	};

	var data = [{
		x: labels,
		y: values,
		type: 'bar'
	}];

	Plotly.newPlot('barChart', data, layout, {showSendToCloud:false});

	var data = [{
		values: values,
		labels: labels,
		type: 'pie'
	}];

	Plotly.newPlot('pieChart', data, layout, {showSendToCloud:false});
}

function renderTable(dataset){
	let tableData = "";
	dataset.forEach((term,i) => {
		tableData += "<tr>";
		tableData += "<td>"+(i+1)+"</td>";
		tableData += "<td>"+term.group+"</td>";
		tableData += "<td>"+term.value+"</td>";
		tableData += "<td>"+term.position+"</td>";
		tableData += "</tr>"
	});
	table.innerHTML = tableData
}