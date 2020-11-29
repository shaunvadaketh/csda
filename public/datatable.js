const inputElement = document.getElementById("input_html_element");
const table_header = document.getElementById("header_id");
const table_body = document.getElementById("table_body");
const tbody_id = document.getElementById("tbody_id");
const table = document.getElementsByClassName("tbl-content")[0];
inputElement.addEventListener("change", fileChange, false)


function fileChange() {

	var file = this.files[0];
	populateHeaderandInitialRows(file);
	
	
	
//console.log(header_row[0]);
//header_row.then(function(result) {console.log("Hello!"); console.log(result[0])})
}

async function findNearestLineStart(file, bytestart, byteend)
{
	var t0 = performance.now()
	var file_slice = await file.slice(bytestart, byteend).text()
	var t1 = performance.now()
	//console.log(t1-t0);
	return file_slice.split(",");
}



async function populateHeaderandInitialRows(file)
{
	var width = table_body.offsetWidth;
	var file_slice = await file.slice(0, 45000).text()
	var rows = file_slice.split("\n")
	var num_rows = rows.length;
	console.log(file.size);
	var header_row = rows[0];
	var header_col_val = header_row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	var split_value = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
	if (header_col_val.length <= 1) {

		if (header_row.split("|").length > 1) {

			split_value = "|";
        }
		header_col_val = header_row.split(split_value);
    }

	var num_col = header_col_val.length;
	var header_string = "";
	var row_string, cell_string;
	var all_rows_string = "";
	var row_split;
	var width_each_col = width / num_col;
	for (var x = 0; x < header_col_val.length; x++) {
		header_string = header_string + "<th>" + header_col_val[x] + "</th>";
	}
	for (var x = 1; x < num_rows - 1; x++) {
		if (x == num_rows - 2) {
		row_string = '<tr> </tr>';
		}
		else {
			row_string = '<tr style="height: 30px;">';
			row_split = rows[x].split(split_value);
			cell_string = "";
			for (var y = 0; y < row_split.length; y++) {
				cell_string = cell_string + '<td style="width: ' + String(width_each_col) + 'px;"> ' + row_split[y] + "</td>";
			}
			row_string = row_string + cell_string + "</tr>";
		}
		all_rows_string += row_string;
    }
	table_header.innerHTML = header_string;
	tbody_id.innerHTML = all_rows_string;
	countNumRows(file, split_value);

}

async function countNumRows(file, split_value) {

	var file_size = file.size;
	var byte_interval = 1000000;
	var number_of_iterations = Math.floor(file_size / byte_interval) + 1;
	var rows;
	var width = table_body.offsetWidth;
	var file_slice = await file.slice(0, 9000).text()
	var rows = file_slice.split("\n")
	var num_cols = rows[0].split(split_value).length;
	var width_each_col = width / num_cols;
	var t0 = performance.now()
	
	var num_row_worker_sum = 0;
	var num_web_workers = Math.floor(file_size / 200000000) + 1;
	var start_index;
	var end_index;
	for (var x = 0; x < num_web_workers; x++) {

		console.log("Value of x is " + x.toString());
		if (x == 0) {

			start_index = 0;
			if (num_web_workers > 1) {
				end_index = 2 * Math.floor(number_of_iterations / num_web_workers) + (number_of_iterations % num_web_workers);
			}

			else {
				end_index = Math.floor(number_of_iterations / num_web_workers) + (number_of_iterations % num_web_workers)

            }
			x = x + 1;
		}

		else {

			start_index = (x) * Math.floor(number_of_iterations / num_web_workers) + (number_of_iterations % num_web_workers);
			end_index = (x + 1) * Math.floor(number_of_iterations / num_web_workers) + (number_of_iterations % num_web_workers)

		}

		window["Webworker" + (x + 1).toString()] = new Worker('countRowsWebWorker.js');
		window["Webworker" + (x + 1).toString()].postMessage([start_index, end_index, file, byte_interval, x])

		window["Webworker" + (x + 1).toString()].onmessage = function (e) {
				
				num_row_worker_sum += e.data[0];
				console.log("Outputting result from worker " + e.data[1]);
				console.log("Number of rows from worker sum is " + num_row_worker_sum);
				if (e.data[1] == 1)
				{
					var t1 = performance.now()
					console.log("Time taken to get sum using web workers");
					console.log(t1 - t0);
					var body_height = (num_row_worker_sum * 30);
					table_body.style.cssText = 'height:' + String(body_height) + "px !important";
					populateDataRows(file, body_height, file_size, width_each_col, split_value);

				}
					
			}
	}

}

async function populateDataRows(file, bodyheight, filesize, width_each_col, split_value) {

	var timer = null;
	table.addEventListener('scroll', async function () {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(async function () {

			var scroll_position = table.scrollTop; 
			var relative_pos = scroll_position / bodyheight;
			var start_byte = relative_pos * filesize;
			console.log(scroll_position);
			var file_slice = await file.slice(start_byte, start_byte+9000).text()
			var t1 = performance.now()
			var rows = file_slice.split("\n")
			var num_rows = rows.length;
			var row_string, cell_string;
			var all_rows_string = "";
			var row_split;
			for (var x = 1; x < 30 - 1; x++) {
				if (x == 30 - 2) {
					row_string = '<tr> </tr>';
				}
				else {
					row_string = '<tr style="height: 30px;">';
					row_split = rows[x].split(split_value);
					cell_string = "";
					for (var y = 0; y < row_split.length; y++) {
						cell_string = cell_string + '<td style="width: ' + String(width_each_col) + 'px;"> ' + row_split[y] + "</td>";
					}
					row_string = row_string + cell_string + "</tr>";
				}
				all_rows_string += row_string;
			}
			all_rows_string += row_string;
			tbody_id.style.top = String(scroll_position) + "px";
			tbody_id.innerHTML = all_rows_string;
		}, 0);
	}, false);



}
