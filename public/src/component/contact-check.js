/**
 * Created by sky on 2017/11/7.
 */
// Contact Form Scripts
jQuery.validator.addMethod("isMobile", function(value, element) {
    var length = value.length;
    var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
    return this.optional(element) || (length == 11 && mobile.test(value));
}, "请正确填写您的手机号码");
var MyValidator = function () {
    var handleSubmit = function () {
        $('#contactForm').validate({
            errorElement: 'span',
            errorClass: 'help-block',
            focusInvalid: true,
            onkeyup: function(element, event) {
                //去除左侧空格
                var value = this.elementValue(element).replace(/^\s+/g, "");
                $(element).val(value);
            },
            // 和元素name属性绑定，竟然不是ID
            rules: {
                name: {
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                phone: {
                    required: true,
                    isMobile : true
                },
                message: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: "请输入名称"
                },
                email: {
                    required: "请输入邮箱",
                    email:"请输入一个正确的邮箱"
                },
                phone: {
                    required: "请输入电话号码"
                },
                message: {
                    required: "内容不能为空呢"
                }
            },

            highlight: function (element) {
                $(element).closest('.form-group').addClass('has-error');
            },

            success: function (label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function (error, element) {
                element.parent('div').append(error);
            },

            submitHandler: function (form) {
                form.submit();
            }
        });

        $('#contactForm input').keypress(function (e) {
            if (e.which == 13) {
                if ($('#contactForm').validate().form()) {
                    $('#contactForm').submit();
                }
                return false;
            }
        });
    }
    return {
        init: function () {
            handleSubmit();
        }
    };

}();
MyValidator.init();