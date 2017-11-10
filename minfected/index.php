<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF­8" />
<title>Kultur Uni Game Dev!</title>
    <script src="phaser.js"></script>
    <script src="phaser-debug.js"></script>
    <script src="plugins/screenShake.js"></script>

    <script src="Model/GameObjects.js"></script>
    <script src="HUDModel/HUDModel.js"></script>
    
        <script src="Screens/boot.js"></script>
        <script src="Screens/load.js"></script>
        <script src="Screens/menu.js"></script>
        <script src="Screens/play.js"></script>
        
    <script src="Screens/ScreenManager.js"></script>
    
    <link rel="stylesheet" type="text/css" href="CSS/style.css">
</head>
<body>
    <h1 id="fb-welcome"></h1>
   <script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1051500208231060',
      xfbml      : true,
      version    : 'v2.6'
    });
        function onLogin(response) {
          if (response.status == 'connected') {
            FB.api('/me?fields=first_name', function(data) {
              var welcomeBlock = document.getElementById('fb-welcome');
              welcomeBlock.innerHTML = 'Hello, ' + data.first_name + '!';
            });
          }
        }

        FB.getLoginStatus(function(response) {
          // Check login status on load, and if the user is
          // already logged in, go directly to the welcome message.
          if (response.status == 'connected') {
            onLogin(response);
          } else {
            // Otherwise, show Login dialog first.
            FB.login(function(response) {
              onLogin(response);
            }, {scope: 'user_friends, email'});
          }
        });
    // ADD ADDITIONAL FACEBOOK CODE HERE
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>
    
</body>
</html>
