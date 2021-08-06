pipeline {
  agent any
  
//   properties([pipelineTriggers([githubPush()])])
   triggers {
    githubPush()
  }

    environment {
        GIT_URL = "https://will221223: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@github.com/will221223/nodejsBlog.git"
        branch = 'master'
        MAINTAINER = "will221223@gmail.com"
    }
    
  tools {nodejs "node"}

  stages {    
    stage('Cloning Git') {
      steps {
        git 'https://will221223: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@github.com/will221223/nodejsBlog.git'
      }
    } 
    stage('Install dependencies') {
      steps {
        sh 'npm i -save'
      }
    }   
    stage('run test') {
      steps {
         sh 'npm run test'
      }
    }             
  }
 
post{
    failure {
             emailext body: "test", subject: 'test pipeline mail', to: "${MAINTAINER}"
     }
  } 
}
  
  