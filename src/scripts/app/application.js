cm.convertDate = function(str){
    if(str){
        var num = str.split(' '),
            num2,
            num3;
        // Date Time
        if(num[1]){
            num2 = num[0].split('-');
            num3 = num[1].split(':');
            return new Date(num2[0], parseInt(num2[1] - 1), num2[2], num3[0], num3[1]);
        }else{
            num2 = str.split('-');
            return new Date(num2[0], ((num2[1] == '00') ? '00' : num2[1] - 1), ((num2[2] == '00') ? '01' : num2[2]));
        }
    }else{
        return '';
    }
};