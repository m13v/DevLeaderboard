function isValidUrl(string) {
     try {
       new URL(string);
       return true;
     } catch (err) {
       return false;
     }
   }

   console.log(isValidUrl('https://github.com/matthew-heartful/DevLeaderboard'));
