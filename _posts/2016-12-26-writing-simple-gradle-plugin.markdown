---
layout: post
title: Writing simple Gradle plugin
date: 2016-02-26
description: Implementing simple Gradle plugin supporting property passing to test execution.
category: blog
comments: true
tag:
- gradle
- groovy
- testing
---

Recently, in my current project we have stumbled upon an issue with [Gradle](http://gradle.org/). To give some context, 
we use gradle as our build tool. We use it also to execute [Cucumber](https://cucumber.io/) and 
[Selenium](http://www.seleniumhq.org/) based end2end tests. As the test suite grew we started to add more and more 
properties to its configuration. We started also to execute those tests not only on CI environment but also on other 
machines (development environments for example). Soon we wanted to be able to overwrite the test properties while 
scheduling the build. Having experience from [Maven](https://maven.apache.org/), we simply thought that 
adding ```-D``` parameter to the build with properties specified, would overwrite those which we have defined. 
Unfortunately after some digging it turned out that gradle will not by default pass to test execution any properties
specified with ```-P``` nor ```-D```. More on that can be read in many stackoverflow topics:

- [http://stackoverflow.com/questions/17851413/gradle-doesnt-pass-system-properties-to-test-classes](http://stackoverflow.com/questions/17851413/gradle-doesnt-pass-system-properties-to-test-classes)
- [http://stackoverflow.com/questions/21406265/how-to-give-system-property-to-my-test-via-gradle-and-d](http://stackoverflow.com/questions/21406265/how-to-give-system-property-to-my-test-via-gradle-and-d)
- [http://stackoverflow.com/questions/5641408/how-can-i-pass-jvm-system-properties-on-to-my-tests](http://stackoverflow.com/questions/5641408/how-can-i-pass-jvm-system-properties-on-to-my-tests)

I have quickly tackled the problem with a little bit of test task configuration:
{% highlight groovy%}
test {
    gradle.startParameter.projectProperties.each { key, value -> systemProperty key, value }
}
{% endhighlight %}

I used project properties (```-P```) to keep compatibility with our previous approach. But nothing actually stands in 
the way to make use of system arguments(```-D```). To use those, the configuration needs only a small change:
{% highlight groovy%}
test {
    gradle.startParameter.systemPropertiesArgs.each { key, value -> systemProperty key, value }
}
{% endhighlight %}


## Plugin
That is mostly it as it comes to giving some context. After the fix I thought that maybe it could be nice to write a 
plugin which gives exactly the same functionality. The solution for the problem isn't any rocket science, that it would 
require a plugin, but it seemed like a good idea to try something different. So I started to read about how to 
start. It actually turned out to be quite easy. You can define a plugin for gradle in the ``build.gradle`` file itself.

{% highlight groovy%}
apply plugin: GradlePlugin  

class GradlePlugin implements Plugin<Project> {
    @Override
    void apply(Project project) {
    }
}
{% endhighlight %}

And that's it. Simple plugin created and ready to be used. And after couple of changes and tests, my plugin ended up on 
my [github](https://github.com/gmaslowski) and the end result looked like that:

{% highlight groovy%}
package com.gmaslowski.gradle.plugin.property

import org.gradle.api.Plugin
import org.gradle.api.Project

class PropertyGradlePlugin implements Plugin<Project> {

    @Override
    void apply(Project project) {
        project.gradle.taskGraph.whenReady { graph ->
            if (graph.hasTask(':test')) {
                project.tasks.getByName('test').configure {
                    project.gradle.startParameter.systemPropertiesArgs.each { key, value -> systemProperty key, value }
                }
            }
        }
    }
}
{% endhighlight %}

There's nothing really fancy going on there. The plugin waits until the task graph is being created, and than if a 
``test`` task exists, it gets configured to set system properties for test execution from the command line arguments. So
invoking the tests like that ```gradle test -Dproperty=value``` would set property ``property`` with ``value`` value 
for tests execution. The source code can be found at [https://github.com/gmaslowski/property-gradle-plugin](https://github.com/gmaslowski/property-gradle-plugin).


## Plugin Repository
And there came the moment where I thought I'd like to share my plugin with the rest of the world :D. Honestly, I just 
wanted to have it somewhere available for others to use. So my first choice was [Bintray](https://bintray.com/). But it 
is even easier than that! Gradle has it's own plugin repository available at [https://plugins.gradle.org/](https://plugins.gradle.org/)
and even provides a simple page with instructions for publishing plugins available at [https://plugins.gradle.org/docs/publish-plugin](https://plugins.gradle.org/docs/publish-plugin).
There is a requirement to have an account and use the provided API keys (all described here -> [https://plugins.gradle.org/docs/submit](https://plugins.gradle.org/docs/submit)).
Having everything set up, in order to publish the plugin, it's only required to invoke ```gradle publishPlugins``` and the plugin gets
uploaded to the repository. Gradle even provide a page with description on how the uploaded plugin should be used. 

{% highlight groovy%}
buildscript {
  repositories {
    maven {
      url "https://plugins.gradle.org/m2/"
    }
  }
  dependencies {
    classpath "gradle.plugin.com.gmaslowski.gradle.plugin.property:property-gradle-plugin:0.4"
  }
}

apply plugin: "com.gmaslowski.gradle.plugin.property"
{% endhighlight %}

That can be found at [https://plugins.gradle.org/plugin/com.gmaslowski.gradle.plugin.property](https://plugins.gradle.org/plugin/com.gmaslowski.gradle.plugin.property)


## Links
- Property plugin [https://plugins.gradle.org/plugin/com.gmaslowski.gradle.plugin.property](https://plugins.gradle.org/plugin/com.gmaslowski.gradle.plugin.property)
- Property plugin sourcecode [https://github.com/gmaslowski/property-gradle-plugin](https://github.com/gmaslowski/property-gradle-plugin)
- Gradle plugins submission guide [https://plugins.gradle.org/docs/submit](https://plugins.gradle.org/docs/submit)
