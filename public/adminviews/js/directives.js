/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)
MetronicApp.directive('ngSpinnerBar', ['$rootScope',
    function($rootScope) {
        return {
            link: function(scope, element, attrs) {
                // by defult hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function() {
                    element.removeClass('hide'); // show spinner bar
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function() {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu
                   
                    // auto scorll to page top
                    setTimeout(function () {
                        Metronic.scrollTop(); // scroll to the top on content load
                    }, $rootScope.settings.layout.pageAutoScrollOnLoad);     
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function() {
                    element.addClass('hide'); // hide spinner bar
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function() {
                    element.addClass('hide'); // hide spinner bar
                });
            }
        };
    }
])

// Handle global LINK click
MetronicApp.directive('a', function() {

    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function(e) {
                    e.preventDefault(); // prevent link click for above criteria
                });
            }
        }
    };
});

// Handle Dropdown Hover Plugin Integration
MetronicApp.directive('dropdownMenuHover', function () {
  return {
    link: function (scope, elem) {
      elem.dropdownHover();
    }
  };  
});

MetronicApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

MetronicApp.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
});

MetronicApp.directive('ckeditor', ['$timeout', '$q', function ($timeout, $q) {
        
        return {
            restrict: 'AC',
            require: ['ngModel', '^?form'],
            scope: false,
            link: function (scope, element, attrs, ctrls) {

                var ngModel = ctrls[0];
                var form = ctrls[1] || null;
                var EMPTY_HTML = '<p></p>',
                    isTextarea = element[0].tagName.toLowerCase() === 'textarea',
                    data = [],
                    isReady = false;

                if (!isTextarea) {
                    element.attr('contenteditable', true);
                }

                var onLoad = function () {
                    
                    var options = {
                        toolbar: 'full',
                        toolbar_full: [ //jshint ignore:line
                            {
                                name: 'basicstyles',
                                items: ['Bold', 'Italic', 'Strike', 'Underline']
                            },
                            {name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote']},
                            {name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                            {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                            {name: 'tools', items: ['SpellChecker', 'Maximize']},
                            '/',
                            {
                                name: 'styles',
                                items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat']
                            },
                            {name: 'insert', items: ['Image', 'Table', 'SpecialChar']},
                            {name: 'forms', items: ['Outdent', 'Indent']},
                            {name: 'clipboard', items: ['Undo', 'Redo']},
                            {name: 'document', items: ['PageBreak', 'Source']}
                        ],
                        disableNativeSpellChecker: false,
                        uiColor: '#FAFAFA',
                        height: '400px',
                        width: '100%',

                        allowedContent:true,
                        language: 'en',
                        uiColor: '#cfcfcf',
                        strinsert_button_label:'Content Block',
                        strinsert_button_title:'Insert Content Block',
                        strinsert_button_voice:'Insert Content Block',                        
                        filebrowserImageBrowseUrl:'/admin/global/browsegraphics',
                        filebrowserUploadUrl:'/admin/global/uploadgraphics'
                    };
                    options = angular.extend(options, scope[attrs.ckeditor]);

                    var instance = (isTextarea) ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options),
                        configLoaderDef = $q.defer();

                    element.bind('$destroy', function () {
                        if (instance && CKEDITOR.instances[instance.name]) {
                            CKEDITOR.instances[instance.name].destroy();
                        }
                    });
                    var setModelData = function (setPristine) {
                        var data = instance.getData();
                        if (data === '') {
                            data = null;
                        }
                        $timeout(function () { // for key up event
                            if (setPristine !== true || data !== ngModel.$viewValue) {
                                ngModel.$setViewValue(data);
                            }

                            if (setPristine === true && form) {
                                form.$setPristine();
                            }
                        }, 0);
                    }, onUpdateModelData = function (setPristine) {
                        if (!data.length) {
                            return;
                        }

                        var item = data.pop() || EMPTY_HTML;
                        isReady = false;
                        instance.setData(item, function () {
                            setModelData(setPristine);
                            isReady = true;
                        });
                    };

                    instance.on('pasteState',   setModelData);
                    instance.on('change', setModelData);
                    instance.on('blur', setModelData);
                    //instance.on('key',          setModelData); // for source view

                    instance.on('instanceReady', function () {
                        scope.$broadcast('ckeditor.ready');
                        scope.$apply(function () {
                            onUpdateModelData(true);
                        });

                        instance.document.on('keyup', setModelData);
                    });
                    instance.on('customConfigLoaded', function () {
                        configLoaderDef.resolve();
                    });

                    ngModel.$render = function () {
                        data.push(ngModel.$viewValue);
                        if (isReady) {
                            onUpdateModelData();
                        }
                    };
                };

                if (CKEDITOR.status === 'loaded') {
                    loaded = true;
                }
                if (loaded) {                    
                    onLoad();
                } else {

                    $defer.promise.then(onLoad);
                }
            }
        };
    }]);

