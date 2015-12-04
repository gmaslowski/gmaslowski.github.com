---
layout: post
title: Beyond JUnit - Testing with Groovy and Spock
date: 2015-12-04
description: How to leverage the power of Groovy and Spock for testing Java applications.
comments: true
---

Working on Java applications I’ve found that all projects have something in common so far as testing is concerned. 
Most of the time Java developers use a proven and bulletproof set of libraries which support testing quite well. 
Let’s iterate and name them:

- test runners - [JUnit](http://junit.org/), [TestNG](http://testng.org/doc/index.html)
- [mocking](http://martinfowler.com/articles/mocksArentStubs.html) frameworks [Mockito](http://mockito.org/), [PowerMock](https://code.google.com/p/powermock/)
- assertions - [AssertJ](http://joel-costigliola.github.io/assertj/), [FestAssertions](https://code.google.com/p/fest/), [Harmcrest](https://code.google.com/p/hamcrest/)
- others: [Awaitility](https://github.com/jayway/awaitility), [ParameterizedTests](https://github.com/Pragmatists/junitparams)
- api testing support - [Retrofit](http://square.github.io/retrofit/), [RESTEasy](http://resteasy.jboss.org/)

Being in the industry for couple of years now, I know that without proper testing approach (which actually can depend on many aspects like: 
project nature; team habits, knowledge and experience; that’s actually a topic for longer and different discussion) teams are not able to 
deliver good quality projects. What I’ve found though, is that I dislike introducing a new library for each problem I’m trying to solve. 
Yeah, Java developers know what I’m talking about. You want to have a decent expected exception handling in your test?
Use [catch-exception](https://code.google.com/p/catch-exception/). 
You want to have nice asserts? Use AssertJ. Your tests are time relevant? Use Awaitility.
Well. Maybe I’m exaggerating, but such approach made me search for something different.
And during some Java conference I’ve been introduced to Groovy with Spock for testing purposes. The simplicity, readability and ease 
of use struck me at the very first glance. 

## Introducing Groovy with Spock

> Spock is a testing and specification framework for Java and Groovy applications. What makes it stand out from the crowd is its beautiful and highly expressive specification language. Thanks to its JUnit runner, Spock is compatible with most IDEs, build tools, and continuous integration servers. Spock is inspired from JUnit, jMock, RSpec, Groovy, Scala, Vulcans, and other fascinating life forms.
>
> [http://spockframework.github.io/spock/docs/1.0/introduction.html](http://spockframework.github.io/spock/docs/1.0/introduction.html)

I don’t want to cover the basics with using Groovy and Spock, simply because there are already good introduction points available on the web:

- [https://code.google.com/p/spock/wiki/SpockBasics](https://code.google.com/p/spock/wiki/SpockBasics)
- [http://www.groovy-lang.org/learn.html](http://www.groovy-lang.org/learn.html)

I also don’t consider myself a Groovy, nor Spock expert, however Groovy being a dynamic language makes me think of it as a great 
alternative for testing my code. Not only my Groovy code, but also Java. So simply, even if I have a purely Java project, why 
shouldn’t I try make my life easier and write tests with Groovy? In coming examples I’ll try to close the gap and focus on how most 
of the test types could be written.


## Examples

So that’s about the theory and what marketing has to say about this topic. In couple of next examples I’ll show how tests can be written 
with this tremendous duel. 

### Mocking

|JUnit and Mockito|
{% highlight java%}
@Before
public void injectMocks() {
    MockitoAnnotations.initMocks(this);
}

@Mock
private DummyRepository dummyRepository;

@InjectMocks
private DummyService dummyService;

@Test
public void shouldDeactivateDummyOnRetrievalOfNotActiveDummy() {
    // given
    given(dummyRepository.getDummyById(anyInt())).willReturn(NOT_ACTIVE_DUMMY_OBJECT);
    
    // when
    Dummy dummy = dummyService.dummyLogic(dummyId);
    
    // then
    assertThat(dummy.isActive()).isFalse();
}
{% endhighlight %}
|
Groovy and Spock|
{% highlight groovy%}
def dummyRepository = Mock(DummyRepository)

def dummyService = new DummyService(dummyRepository)

private int dummyId = 17

def "should deactivate dummy on retrieval of not active dummy"() {

    setup:
    dummyRepository.getDummyById(dummyId) >> NOT_ACTIVE_DUMMY_OBJECT
    
    when:
    def dummy = dummyService.dummyLogic(dummyId)
    
    then:
    !dummy.active
}
{% endhighlight %}
|

What I find very attractive as it comes to mocking is its simplicity when using Spock. It’s also simple with Mockito of course, 
however the dsl is more verbose.

### Parametrized tests

|JUnit and JUnitParams|
{% highlight java %}
@Test
@Parameters({"1, 7, 8", "5, 18, 23"})
public void shouldAddTwoNumbers(int el1, int el2, int expectedSum) {
    // given
    int sum = 0;
    
    // when
    sum = el1 + el2;
    
    // then
    assertThat(expectedSum).isEqualTo(sum);
}
{% endhighlight %}
|
Groovy and Spock|
{% highlight groovy %}
@Unroll
def "#el1 + #el2 should be #expectedSum"() {
    when:
    sum = el1 + el2;
    
    then:
    sum == expectedSum;
    
    where:
    el1 | el2 | expectedSum
    1   | 13  | 14
    7   | 25  | 32
    15  | 485 | 500
}
{% endhighlight %}
|

I think that this comparison doesn’t require too much of description. The table approach is so much expressive and easy to follow, 
that as far as I’m concerned it makes really a huge difference. A nice thing to note, is that with modern IDEs (such as IntelliJ) code 
formatting simply works even with those tables. So you shouldn’t be worried about it.

### Spring integration testing

For those who are afraid on how to write their spring integration tests (while using spring-test’s test context) I’ll just show 
simple example on how to achieve that in Groovy. There’s a library ([spock-spring](https://code.google.com/p/spock/wiki/SpringExtension)) 
that needs to be added to the build definition. However the test itself is really concise and easy to follow. 

{% highlight groovy %}
@ContextConfiguration(classes = ApplicationConfig.class)
class SpringIntegrationSpecification extends Specification {

    @Autowired
    TestedSpringBean someBean;

    def "test"() {
        expect:
        someBean.doSomeWork() != null
    }
}
{% endhighlight %}

So if you’re a Spring application developer, there’s no need to worry. Spock supports you with that, so you can write your 
integration tests with spring context. Of course spring itself is still required as a dependency in the project.

### REST API tests
REST is the standard in current application development. We usually integrate our microservices with REST. 
Besides, while creating Single Page Applications, we commonly use REST for browser-server communication. 
So it’s already out of the question that at some point we’re starting to write integration tests, which are testing systems via 
API calls. With Groovy, testing REST APIs is simple and easy to follow. Groovy is a dynamic language which allows the developer to assert 
JSONs without defining its structure for the project. I find this quite nice, because I don’t have to use the JSON representation 
classes in my tests. And besides that I can actually write my microservice in other language than Java and still be able to use my tests.

{% highlight groovy %}

def "should get info about driver"() {

    given:
    def client = new RESTClient("http://ergast.com")

    when:
    def resp = client.get(path: "/api/f1/constructors/mclaren/circuits/monza/drivers/alonso.json")

    then:
    println resp.data
    println resp.data.MRData.DriverTable.Drivers
}

{% endhighlight %}

## Conclusion

That were only couple of samples which I wanted to share in this post. More of such simple test snippets can be found on my 
github repository: [https://github.com/gmaslowski/spock-groovy-sample/](https://github.com/gmaslowski/spock-groovy-sample/). 
I’ve created a project where in practical example I’m showing how to achieve the same thing with Groovy and Spock as with 
Java and additional libraries. Currently I would also like to show how to do [ATDD](https://en.wikipedia.org/wiki/Acceptance_test-driven_development)
 with Groovy and Spock, so that [Cucumber](https://cucumber.io/) and [JBehave](http://jbehave.org/) users are not left behind. But I think, 
 that I'll do that in another post.

## Why even bother?
I can imagine that developers will say that the “old way” works and is proven and they may not see the reason to change. 
Well, if the easiness of writing tests isn’t enough than maybe the benefit of learning something new would break the ice. 
We’re in an industry which demands being up to date and constant learning. So how could we better achieve that, than by 
incorporating other solutions to our projects? We broaden our horizons by learning new stuff, and taking small steps while 
learning gives us the ability to get along with other technologies. Changing our approach on testing fits into such scenario quite well.

## Links
- [https://github.com/gmaslowski/spock-groovy-sample/](https://github.com/gmaslowski/spock-groovy-sample/)
- [https://code.google.com/p/spock/](https://code.google.com/p/spock/)
- [http://www.groovy-lang.org/](http://www.groovy-lang.org/)
- [http://shop.oreilly.com/product/0636920038597.do](http://shop.oreilly.com/product/0636920038597.do)
