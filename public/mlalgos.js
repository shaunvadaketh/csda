//hyp = theta_0 * x_0 + theta_1 * x_1 + theta_2 * x_2
//theta = [theta_0, theta_1, theta_2]
//x = [[1, 2, 3], [1, 3, 4], [1, 5, 6], [1, 2, 8]]
//y = [3, 4, 5, 7]

function gradientDescent(x_data, y_data, alpha, theta){
    m = y_data.length;
    array_of_errors = [];
    new_theta = []
    for(x = 0; x < m; x++)
    {
        hypothesis = 0;
        for(y = 0; y < theta.length; y++)
        {
            hypothesis += theta[y] * x_data[x][y];
        }
        error_term = hypothesis - y_data[m];
        array_of_errors.push(error_term);
    }
    for(x = 0; x < theta.length; x++)
    {
        sum_errors = 0;
        for(z = 0; z < m; z++)
        {
            sum_errors += array_of_errors[z] * x_data[x][z];
        }
        new_theta[x] = theta[x] - (alpha * (1/m) * sum_errors);
    }
    return new_theta

}   