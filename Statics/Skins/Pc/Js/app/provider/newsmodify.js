/**
 * Created by wangzan on 2016/3/12.
 */
define(['validate', 'webuploader', 'jquery', 'kindEditor', 'zh_CN', 'Core', 'Front', 'app/common'], function (validate, WebUploader){
    $(function (){
        var uploadImg, editor, uploaderConfig;
        init();
        //提交 submit为保存,draft为生成草稿
        $('#submit').click(function (){
            var params = {};
            var validation = validate.checkFields($('.checkfield'));
            if(validation.length){
                validation[0].ele.focus();
                return false;
            }
            var content = editor.html();
            if($('#logo').length == 0){
                layer.msg('请上传封面');
                return false;
            }
            if(content.length < 20){
                layer.msg('新闻内容过少');
                editor.focus();
                return false;
            }
            params.title = $('#title').val();
            params.defaultPicUrl = [$('#logo').attr('src'), $('#logo').attr('fh-rid')];
            params.content = content;
            params.nodeId = $('#nodeId').val();
            $.extend(params, getEditorFileRef(content));
            params.fileRefs.push(params.defaultPicUrl[1]);
            //获取ID
            var path = window.location.pathname.split('/');
            params.id = parseInt(path.pop());
            Cntysoft.Front.callApi('Site', 'modifyContent', params, function (response){
                if(response.status){
                    layer.msg('发表成功!', {
                        time : 1000
                    }, function (){
                        window.location.href = '/site/news/1.html';
                    });
                } else{
                    if(response.errorCode == 10004){
                        layer.alert('文章标题重复!');
                        return false;
                    }
                    layer.alert('发表失败,请稍候再试!');
                }
            });
        });
        $('.img_uploading').delegate('.deleteImg', 'click', function (){
            $(this).closest('li').remove();
            $('.img_plus').show();
            if(uploadImg == undefined){
                createUploader();
            }
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
            //上传的默认配置项
            uploaderConfig = {
                chunked : false,
                auto : true,
                threads : 1,
                duplicate : true,
                accept : {
                    title : 'Images',
                    extensions : 'gif,jpg,jpeg,bmp,png',
                    mimeTypes : 'image/*'
                },
                server : '/front-api-entry',
                formData : {
                    REQUEST_META : Cntysoft.Json.encode({
                        cls : "Uploader",
                        method : "process"
                    }),
                    REQUEST_DATA : Cntysoft.Json.encode({
                        uploadDir : "/Data/UploadFiles/Apps/YunZhan",
                        overwrite : true,
                        randomize : true,
                        createSubDir : true,
                        enableFileRef : true,
                        useOss : true
                    }),
                    REQUEST_SECURITY : Cntysoft.Json.encode({})
                }
            };
            createEditorUplad();
            if(!$('#logo').length){
                createUploader();
            }
        }

        function createUploader(){
            //处理上传
            uploadImg = WebUploader.create($.extend(uploaderConfig, {
                pick : {id : '.img_plus', multiple : false},
                compress : {
                    width : 1028,
                    height : 800,
                    compressSize : 1000000
                }
            }));
            //logo上传成功
            uploadImg.on('uploadSuccess', function (file, response){
                if(response.status){
                    var out = '<li><img id="logo" src="' + response.data[0].filename + '" fh-rid="' + response.data[0].rid + '"><em class="deleteImg">删除</em></li>';
                    $('.img_plus').siblings('li').remove();
                    $('.img_plus').before(out);
                    $('.img_plus').hide();
                }
            });
        }
        //初始化编辑器
        function createEditorUplad(){
            var $editorUpload = $('body').append('<div class="hide" id="editorUpload"></div>');
            var editorUpload = WebUploader.create($.extend(uploaderConfig, {
                pick : '#editorUpload',
                compress : {
                    width : 1024,
                    height : 5000,
                    compressSize : 1000000
                }
            }));
            //添加图片上传插件
            $('head').append('<style type="text/css" rel="stylesheet">.ke-icon-upload {background-position: 0px -496px;' +
            'width: 50px;height: 16px;}</style>');
            KindEditor.plugin('upload', function (K){
                var editor = this, name = 'upload';
                // 点击图标时执行
                editor.clickToolbar(name, function (){
                    $('#editorUpload input').click();
                });
            });
            KindEditor.lang({
                hello : '你好'
            });
            //实例化编辑器
            editor = KindEditor.create('#info_editor', {
                allowImageUpload : false,
                items : ['source', '|', 'undo', 'redo', '|', 'plainpaste', 'wordpaste', '|', 'upload', 'justifyleft', 'justifycenter', 'justifyright',
                    'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                    'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
                    'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                    'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat',
                    'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
                    'anchor', 'link', 'unlink'],
                pluginsPath : '/Statics/Skins/Pc/Images/kindeditor/plugins/',
                htmlTags : {
                    font : ['color', 'size', 'face', '.background-color'],
                    span : [
                        '.color', '.background-color', '.font-size', '.font-family', '.background',
                        '.font-weight', '.font-style', '.text-decoration', '.vertical-align', '.line-height'
                    ],
                    div : [
                        'align', '.border', '.margin', '.padding', '.text-align', '.color',
                        '.background-color', '.font-size', '.font-family', '.font-weight', '.background',
                        '.font-style', '.text-decoration', '.vertical-align', '.margin-left'
                    ],
                    table : [
                        'border', 'cellspacing', 'cellpadding', 'width', 'height', 'align', 'bordercolor',
                        '.padding', '.margin', '.border', 'bgcolor', '.text-align', '.color', '.background-color',
                        '.font-size', '.font-family', '.font-weight', '.font-style', '.text-decoration', '.background',
                        '.width', '.height', '.border-collapse'
                    ],
                    'td,th' : [
                        'align', 'valign', 'width', 'height', 'colspan', 'rowspan', 'bgcolor',
                        '.text-align', '.color', '.background-color', '.font-size', '.font-family', '.font-weight',
                        '.font-style', '.text-decoration', '.vertical-align', '.background', '.border'
                    ],
                    a : ['href', 'target', 'name'],
                    embed : ['src', 'width', 'height', 'type', 'loop', 'autostart', 'quality', '.width', '.height', 'align', 'allowscriptaccess'],
                    img : ['src', 'fh-rid', 'data-original', 'class', 'width', 'height', 'border', 'alt', 'title', 'align', '.width', '.height', '.border'],
                    'p,ol,ul,li,blockquote,h1,h2,h3,h4,h5,h6' : [
                        'align', '.text-align', '.color', '.background-color', '.font-size', '.font-family', '.background',
                        '.font-weight', '.font-style', '.text-decoration', '.vertical-align', '.text-indent', '.margin-left'
                    ],
                    pre : ['class'],
                    hr : ['class', '.page-break-after'],
                    'br,tbody,tr,strong,b,sub,sup,em,i,u,strike,s,del' : []
                }
            });
            var iframeBody = $('.ke-edit-iframe')[0].contentWindow.document.body;
            var $introImg = $(iframeBody).find('img');
            $.each($introImg, function (index, item){
                $(item).attr('src', $(item).attr('data-original'));
            });
            editor.html($(iframeBody).html());
            //编辑器上传图片
            editorUpload.on('uploadSuccess', function (file, response){
                if(response.status){
                    editor.insertHtml('<p fh-type="img"><img fh-rid="' + response.data[0].rid + '" src="' + response.data[0].filename + '"></p>');
                }
            });
        }


        function getEditorFileRef(content){
            var imgReg = /<img fh-rid="[\d]*" src="[\w\.\/\:\-]*"[\s]*?\/>/gim;
            var imgArray = content.match(imgReg);
            var params = {
                imgRefMap : [],
                fileRefs : []
            };
            if(imgArray != null){
                for(var i = 0, length = imgArray.length; i < length; i++) {
                    var ridSrc = imgArray[i].match(/<img fh-rid="([\d]*)" src="([\w\.\/\:\-]*)"[\s]*?\/>/);
                    params.imgRefMap.push([ridSrc[2], ridSrc[1]]);
                    params.fileRefs.push(ridSrc[1]);
                }
            }
            return params;
        }
    });
});