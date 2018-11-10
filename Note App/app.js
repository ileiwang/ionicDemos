angular.module('todo', ['ionic'])
  /**
   * The Projects factory handles saving and loading projects
   * from local storage, and also lets us save and load the
   * last active project index.
   */
  .factory('Projects', function () {
    return {
      all: function () {
        var projectString = window.localStorage['projects'];
        if (projectString) {
          return angular.fromJson(projectString);
        }
        return [];
      },
      save: function (projects) {
        window.localStorage['projects'] = angular.toJson(projects);
      },
      newProject: function (projectTitle) {
        // Add a new project
        return {
          title: projectTitle,
          tasks: []
        };
      },
      getLastActiveIndex: function () {
        return parseInt(window.localStorage['lastActiveProject']) || 0;
      },
      setLastActiveIndex: function (index) {
        window.localStorage['lastActiveProject'] = index;
      }
    }
  })

  .controller('TodoCtrl', function ($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {

    // A utility function for creating a new project
    // with the given projectTitle
    var createProject = function (projectTitle) {
      var newProject = Projects.newProject(projectTitle);
      $scope.projects.push(newProject);
      Projects.save($scope.projects);
      $scope.selectProject(newProject, $scope.projects.length - 1);
    }


    // Load or initialize projects
    $scope.projects = Projects.all();

    // Grab the last active, or the first project
    $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

    // Called to create a new project
    $scope.newProject = function () {
      var projectTitle = prompt('项目名称');
      if (projectTitle) {
        createProject(projectTitle);
      }
    };

    $scope.deleteProject = function (project, index) {
      $scope.projects.splice(index, 1);
      Projects.save($scope.projects);
    };

    // Called to select the given project
    $scope.selectProject = function (project, index) {
      $scope.activeProject = project;
      Projects.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(false);
    };

    // Create our modal
    $ionicModal.fromTemplateUrl('new-task.html', function (modal) {
      $scope.taskModal = modal;
    }, {
        //子类的范围
        scope: $scope,
        //点击背景时是否关闭模态窗口，默认true
        
        backdropClickToClose:false

      });

    $scope.createTask = function (task) {
      if (!$scope.activeProject || !task) {
        return;
      }
      $scope.activeProject.tasks.push({
        title: task.title
      });
      $scope.taskModal.hide();

      // Inefficient, but save all the projects
      Projects.save($scope.projects);

      task.title = "";
    };

    $scope.deleteTask = function (task, index) {
      if (task) {
        $scope.activeProject.tasks.splice(index, 1);
        Projects.save($scope.projects);
      }
    };

    $scope.newTask = function () {
      $scope.taskModal.show();
    };

    $scope.closeNewTask = function () {
      $scope.taskModal.hide();
    };

    $scope.toggleProjects = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.data = {
	    showDelete: false
	  };
	  
	  $scope.edit = function(task) {
	    alert('Edit Task: ' + task.title);
	  };
	  $scope.share = function(task) {
	    alert('Share Task: ' + task.title);
	  };
	  
	  $scope.moveTask = function(task, fromIndex, toIndex) {
      $scope.activeProject.tasks.splice(fromIndex, 1);
      $scope.activeProject.tasks.splice(toIndex, 0, task);
      Projects.save($scope.projects);
	  };
	  
	  $scope.onTaskDelete = function(task) {
      $scope.activeProject.tasks.splice($scope.activeProject.tasks.indexOf(task), 1);
      Projects.save($scope.projects);
	  };


    // Try to create the first project, make sure to defer
    // this by using $timeout so everything is initialized
    // properly
    $timeout(function () {
      if ($scope.projects.length == 0) {
        while (true) {
          var projectTitle = prompt('请输入第一个项目名称');
          if (projectTitle) {
            createProject(projectTitle);
            break;
          }
        }
      }
    });

  });