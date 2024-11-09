'use strict';

exports.ok = function(values, res){
    const data = {
        'status': 200,
        'values': values
    };
    res.json(data);
    res.end();
};

exports.oknested = function(values, res){
    const result = values.reduce((accumulator, item) => {
        if (accumulator[item.name]) {
            const group = accumulator[item.name];
            if (Array.isArray(group.product_name)) {
                group.product_name.push(item.product_name);
            } else {
                group.product_name = [group.product_name, item.product_name];
            }
        } else {
            accumulator[item.name] = item;
        }
        return accumulator;
    }, {});

    const data = {
        'status': 200,
        'values': result
    };
    res.json(data);
    res.end();
};
