/**
 * Created by Administrator on 2017/1/12.
 */
$(function () {
    //    删除确认
    $('.every .tripe h4 a:nth-child(2)').on('click',function () {
        var r = confirm('确认删除该微博？');
        if(!r){
            event.preventDefault();
        }
    })
    // 发布微博
    $('#homecenter form textarea').keyup(function () {
        textNum();
    })
    textNum()
    // 字数查询
    function textNum(){
        // 总共可以输入的字符数，一个汉字对应两个字符
        var total = 280;
        // 获取输入框长度
        var len = $('#homecenter form textarea').val().length;
        // 表示当前输入框内字符数
        var currentNum = 0;
        if(len >= 0){
            for (var i = 0; i < len; i++) {
                if($('#homecenter form textarea').val().charCodeAt(i) > 255){
                    currentNum +=2;
                }else{
                    currentNum +=1;
                }
            }
        }
        // 计算还可以输入的字符
        var result = Math.floor((total - currentNum)/2);
        if (result >=0 && $('#homecenter form textarea').val()) {
            $('#homecenter form h4 span span').text(result);
            $('#homecenter form .HCTright').css('opacity','1').removeAttr('disabled');
        }else{
            $('#homecenter form h4 span span').text(result);
            $('#homecenter form .HCTright').css('opacity','0.7').attr('disabled','disabled');
        }
    }
})