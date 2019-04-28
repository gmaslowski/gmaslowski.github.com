---
layout: post
title: "(Not really) headless browser test execution."
date: 2019-04-28
description: How to execute browser tests without headless mode?
category: blog
tag:
- linux
- docker
- selenium
- selenide
- testing
- ui
- continuous integration
comments: true
image: assets/headless.png
---

Do you participate in a project which has automated UI tests? Do you get annoyed by the fact that your CI environment is flaky because of UI tests? Do you have enough of maintaining multiple slave nodes of your [Jenkins](https://jenkins.io/) installation just for the sake of OS specific browser behaviour? If you find any of the questions familiar, please read this article where I try to explain what drove me to an obvious solution for a configuration madness I was going through in every project. 

## How do you run your UI based tests? 

Many, many times in previous projects I was questioning myself, why do we keep a VM (or couple of them) together with a Firefox/Chrome installation just for the sake of runnning UI tests. Discussions with QA never really resulted in any different approach. Until a point, sometime in 2017, when I was helping another team with migrating from Jenkins to [GitlabCI](https://about.gitlab.com/product/continuous-integration/). They had their own test automation framework (also UI based) which in previous configuration was using a jenkins-slave-node with Chrome or Firefox inside it, running inside a X session. The team wanted to move to GitlabCI for their CI pipelines, but they didn't know how to tackle the UI based tests.

The approach I'm describing is nor new nor really innovative. I think that I was even surprised myself that I haven't thought of it years before.

## xvfb to the rescue

After quick research, I've found a solution to use headless option to run UI tests. Unfortunately, the team was bound to a Firefox version which did not have a headless option yet. Turned out that another approach was to use [xvfb](https://en.wikipedia.org/wiki/Xvfb). If I recall correctly I was following this blog article [http://elementalselenium.com/tips/38-headless](http://elementalselenium.com/tips/38-headless) in order to get the tests running. With `xvfb` at disposal, the UI testing job could still run a browser within a X session, but without the need to actually display it. Furthermore, I already understood that I can containerize `xvfb` to leverage the [gitlab runner docker executor](https://docs.gitlab.com/runner/executors/docker.html), which spawns docker containers for every executed job. Well, that's great sounds like job done. 

## Applied solution

Unfortunately I don't have the source code I created two years ago, to show the real solution. That's why I decided (for the sake of completeness of this post) to fork the [Selenide](https://selenide.org/) project (which has UI tests inside) and show how one could run *'headless'* tests as I configured them. But before showing the code, let me repeat that the automated framework was bound to Firefox version 63.0.3. For this version the real *headless* option was not available yet - which forced me to create the image in the first place. Additionally, to show how to use headless browsers I've added those options to the project as well.   

`.gitlab-ci.yml`:

{% highlight yaml %}
stages:
  - test

.job_template: &test_job
  only:
    - master
  stage: test
  variables:
    LANG: C.UTF-8
    LC_ALL: C.UTF-8

'Firefox xvfb':
  image: registry.gitlab.com/gmaslowski-blog/headless-docker/images/xvfb-firefox:latest
  <<: *test_job
  script:
    - xvfb-run -a ./gradlew firefox

'Firefox Headless':
  image: registry.gitlab.com/gmaslowski-blog/headless-docker/images/standalone-firefox:latest
  <<: *test_job
  script:
    - ./gradlew firefox_headless

'Chrome Headless':
  image: registry.gitlab.com/gmaslowski-blog/headless-docker/images/standalone-chrome:latest
  <<: *test_job
  script:
    - ./gradlew chrome_headless

{% endhighlight %}

In this snippet I've run the tests in three different base images, with different options:

- using a custom built image and xvfb (with some older Firefox)
- using a [Selenium Standalome Chrome](https://github.com/SeleniumHQ/docker-selenium/tree/master/StandaloneChrome) (with JDK addition)
- using a [Selenium Standalome Firefox](https://github.com/SeleniumHQ/docker-selenium/tree/master/StandaloneFirefox) (with JDK addition)

> For the presentation purposes I needed to built the `standalone-firefox:latest` and `standalone-chrome:latest` images myself, as Selenide is using *Gradle* as the tests runner, which in turn needed at least a JDK available. The presented image description can be found at [https://gitlab.com/gmaslowski-blog/headless-docker/images](https://gitlab.com/gmaslowski-blog/headless-docker/images)

> The **xvfb-firefox** is an image with `xvfb` and Firefox in the specified version. To make firefox in this version work, I needed to install aditional libraries and the gecko driver.

What's visible inside the `.gitlab-ci.yml` file is that there's a stage in which 3 set of tests is being executed, all with different options:

- headless firefox
- headless chrome
- xvfb firefox

That can also be seen in the pipeline [https://gitlab.com/gmaslowski-blog/headless-docker/selenide/pipelines/58815400](https://gitlab.com/gmaslowski-blog/headless-docker/selenide/pipelines/58815400). You can see that the Firefox and Chrome Headless tests are failing. I did not focus too much on them, as the failures appear **only for 2 of 474 tests**. For the sake of this post I did not investigate. Coming back the `xvfb` based approach, with wrapping our command into `xvfb-run -a <command>` we actuall run an in memory X display, which then in turn will have firefox opened. Quite interesting, right? :) Hence, our tests can run inside a container. 

As as side note, any created artifact by the tests (like screenshot with a failure) could be stored inside Gitlab using the [Job Artifacts](https://docs.gitlab.com/ee/user/project/pipelines/job_artifacts.html) feature. Though I haven't shown that in my example it is pretty straight forward to use. Same for the test reports.

## Alternative approaches

I've tackled the problem in the aforementioned way. But was it the best one? For the time being I thought so. However, I'd like to point out, that there are other options which solve the same problem.

### Headless browsers

Starting from 59 version of Chrome, it offers a *headless* functionality, which does not require any X session to be available. It runs purely inside memory - that's a nice alternative to `xvfb` solution. In my case, as stated previously, the tests were bound to a specific version of a browser, which didn't have headless option yet. I didn't really try to adjust the tests to run in newer browser - I estimated that this would be more time consuming approach.

### Selenium Images and Dockerized Selenium Grid

Instead of building own image whith the browser that's needed, one could go for an already predefined image from [Selenium](https://www.seleniumhq.org/) as I've shown for the **not-xvfb** options.

Maintaining [Selenium Grid](https://www.seleniumhq.org/projects/grid/) would eventually end up in lots of work around the hub and the nodes, so there's an easier solution to that. Just dockerize Selenium Grid and endjoy the possibility to have it configured and deployed anywhere you like. In this article [http://www.testautomationguru.com/selenium-grid-setup-using-docker/](http://www.testautomationguru.com/selenium-grid-setup-using-docker/) the author shows how to setup dockerized Selenium Grid with minimal effort. What's more, one could use Docker Swarm or Kubernetes as the orchestration platform for Selenium Grid. One thing I haven't really thought through as it comes to this approach is multi OS configuration - I think that shouldn't be impossible on one hand knowning all the tools. On the other hand I think that a **xvfb-based-headless** approach for older browsers might be impossible to achieve on a Windows container.

### Cloud solutions

If in your company you're lucky enough to have the freedom to choose cloud based solutions (believe me that still in 2019 some companies restrain from it), there are some options for you, like:

- [https://www.gridlastic.com/](https://www.gridlastic.com/)
- [https://testingbot.com/](https://testingbot.com/)
- [https://saucelabs.com/resources/automated-testing/selenium-grid](https://saucelabs.com/resources/automated-testing/selenium-grid)

Those are just couple of solutions I found on the internet. I haven't tested any of those, but they're there if you need them. All of the solutions are claiming to have Selenium Grid underneath, and what would be interesting for me is wether I really need to base my UI tests on Selenium, to actually leverage them?

## Conclusion

What I've learnt in general about approaches to UI tests, besides the obvious technical possibilities? I think that questioning the *status quo* is something really needed in the projects we're building. Many times it happens that we, in IT projects, tend to follow the principles and solutions which were chosen years ago. The technology, solutions and approaches evolves almost constantly. Not saying we should follow them blindly, but at least keep track on what's going on, and choose what's appropriate for the project we're working on. That's, under the circumstances of normal development, quite big effort which needs to be taken.

## Links

- [GitlabCI](https://about.gitlab.com/product/continuous-integration/)
- [Selenium](https://www.seleniumhq.org/)
- [Selenide](https://selenide.org/)
- [Selenium Grid](https://www.seleniumhq.org/projects/grid/)
- [https://gitlab.com/gmaslowski-blog/headless-docker](https://gitlab.com/gmaslowski-blog/headless-docker)
- [http://elementalselenium.com/tips/38-headless](http://elementalselenium.com/tips/38-headless)
- [http://www.testautomationguru.com/selenium-grid-setup-using-docker/](http://www.testautomationguru.com/selenium-grid-setup-using-docker/)
