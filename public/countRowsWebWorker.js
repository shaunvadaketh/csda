onmessage = async function (e) {
    
    var startingIndex = e.data[0];
    var start_of_next_worker = e.data[1];
    
    var file = e.data[2];
    var byte_interval = e.data[3];
    var worker_num = e.data[4]
    var rows;
    var num_rows = 0;
    var file_slice;

    for (var x = startingIndex; x < start_of_next_worker; x++) {

        file_slice = await file.slice((x * byte_interval), ((x + 1) * byte_interval)).text();
        rows = file_slice.split("\n");
        num_rows = num_rows + (rows.length - 1);
        
    }

    
    
    postMessage([num_rows, worker_num]);
}