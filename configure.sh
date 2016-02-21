#!/bin/sh

#configuring the system
wget https://raw.githubusercontent.com/Oupsla/PrettyPR/master/Makefile

#install meteor
curl https://install.meteor.com | /bin/sh

#install velocity cli
npm install -g velocity-cli
