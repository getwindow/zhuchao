/**
 * Created by wangzan on 2016/3/12.
 */
define(['validate', 'webuploader', 'datepicker', 'jquery', 'kindEditor', 'zh_CN', 'Core', 'Front'], function (validate, WebUploader){
    $(function (){
        var images = new Array();
        var editor;
        init();
        $('input[fh-toggle="datepicker"]').datepicker({
            date : new Date(),
            autopick : true
        });
        //提交 submit为保存,draft为生成草稿
        $('#submit').click(function (){
            var params;
            var validation = validate.checkFields($('.checkfield'));
            if(validation.length){
                layer.msg('请正确填写各项');
                return false;
            }
            var content = editor.html();
            if(content.length < 20){
                layer.msg('招聘详情内容过少');
                return false;
            }
            params = validate.getInputValue($('#title,#department,#number'));
            params.content = content;
            params.endTime = parseInt($('#endTime').datepicker('getDate', false).getTime() / 1000);
            params.tel = $('#telCountry').val()+'-'+$('#telArea').val()+'-'+$('#telNum').val()
            console.log(params);
        });

        //根据name获得radio的值
        function getRadioValueByName(name){
            var val = null;
            $.each($('input[name=' + name + ']'), function (index, item){
                if($(item).prop('checked')){
                    val = $(item).val();
                    return false;
                }
            });
            return val;
        }

        function init(){
            createEditorUplad();
        }

        function createEditorUplad(){
            $('body').append('<div class="hide" id="editorUpload"></div>');
            //实例化编辑器
            editor = KindEditor.create('#info_editor', {
                allowImageUpload : false,
                items : ['source', '|', 'undo', 'redo', '|', 'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
                    'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                    'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
                    'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                    'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat',
                    'insertfile', 'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
                    'anchor', 'link', 'unlink'],
                pluginsPath : '/Statics/Skins/Pc/Images/kindeditor/plugins/'
            });
        }
    });
});