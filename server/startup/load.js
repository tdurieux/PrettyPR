//Peut servir à ajouté des données au démerrage de meteor avec .startup

//Permet à la collection Upload d'accéder au chemin vers les uploads
Meteor.settings.public.meteor_env = process.env.PWD;
