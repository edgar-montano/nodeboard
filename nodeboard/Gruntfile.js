module.exports = function (grunt) {
    //project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            multiple: {
                command: [
                    'bower install',
                    'npm install',
                    'node setup.js', //please setup before hand 
                    //'bower install bower_components/bootstrap/bower.json',
                    //'npm install bower_components/bootstrap/package.json',
                    // 'mv  bower_components/bootstrap/dist/ public/bootstrap/',
                    'mv  bower_components/jquery/dist/   public/jquery/',
                    'mv  bower_components/jquery-ui/ public/jquery-ui/',
                    'rm -rf bower_components'].join('&&')
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');

    //Default Tasks
    grunt.registerTask('default', ['shell']);

    //production Tasks
    //grunt.registerTask('dist',[..]);

    //test tasks
};
