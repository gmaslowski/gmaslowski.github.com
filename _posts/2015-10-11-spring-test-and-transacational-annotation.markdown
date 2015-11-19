---
layout: post
title: Spring Test and @Transactional
date: 2015-10-11
description: Seamless work with Spring-Test and @Transactional
---




DISCLAIMER!!!

That's crap! You're writing about test levels more, than about actual problem which is @Transactional in tests!





From time to time I can see Java developers writing integration tests using 
[spring-test](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/integration-testing.html) module 
for their Spring base applications. I find it obviously a good thing, because I think the more confidence a developer 
has with his system the better for the overall quality of the project. Of course sometimes such integration tests, 
especially when poorly written can actually lead to developer frustration. But that's not what I wanted to write about.

## @Transactional

One thing which I keep seeing a lot is using such tests to verify the integration of the system with the database. What 
I find is hard to grasp by most of the developers is the proper usage of @Transactional annotation. They tend to struggle
with it. They often don't know whether they new shiny test should be annotated with @Transactional or not, 
what impact will it have, how to handle the preparation of test data? I hope that by writing couple of my approaches I 
think I'll be able to give some light on that topic.

But before diving a little bit deeper let me just explain how do I tend to split my integration tests in a normal 
Spring based application.

## Difference between @Repository and @Service testing

More than often in most Spring apps, there are some classes which are responsible for data access activities and others
for executing something more related to business logic. In Spring realm you'd mostly annotate them @Repository and 
@Service respectively. In data access classes you'd have your low-level methods for storing, updating and listing the
entity you're working on. (I'm keeping the examples as simple as possible, so don't hunt me for not following DDD or 
CQRS best practices).

{% highlight java %}
@Repository
public interface CustomerDao extends JpaRepository<Long, Customer> {
 
    Customer findById(Long id);
    
    Customer findByEmail(String email);
    
}
{% endhighlight %}

You can notice that I've made use of spring-data. If you're not familiar with it - start by reading 
[Spring-Data](https://www.goodreads.com/book/show/15808127-spring-data?ac=1) book. It will make your development faster[^1]. 

On the other hand a simple business logic class could look like that:
{% highlight java %}
@Service
public class CustomerService {
 
    public void promoteCustomer(Customer toPromote, CustomerType promotion) {
        ...
    }
    
}
{% endhighlight %}

### @Repository integration test

With testing at this level what I usually want to test is: 
- the actual connection to the database 
- the queries that I've written
- JPA mapping correctness

So basically such test would more or less look something like this:


### @Service integration test

But what I'd like to achieve when testing services in a spring-test integration manner? Well, actually for me this is 
an integration test which verifies the system from the uppermost input to my application, through all connected pieces, 
right  to the external systems (like the database). Though, I tend to mock/stub all of the external parts, so that I only 
test the logic which I've written in integration. Being that said, I also test service layer with unit tests.  
 
As it comes from the uppermost input into the system, I tend to leave out the controller level. Mostly it's task is to 
map JSON payloads into domain language and do other web related stuff. If needed, I test controllers only by unit tests.
That doesn't of course mean, that I don't write integration tests from outside of the system when all parts (like database)
are already in place. I do that, however that's the integration which I tend to verify on a testing/prestaging/staging 
environment (depends on the actual project) with closer collaboration with QA guys.

For CRUD applications it may be tempting to test the whole system 

## Handling integration tests data

Whatever you do, remember to keep consistency in all of the integration tests at least across one module!


## Links
- [Spring Test module documentation](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/integration-testing.html)
- [Sample application](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/integration-testing.html)
- [spring-test](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/integration-testing.html)


---
[^1]: One caveat though. New levels of abstraction solve and produce problems, so simply developers need to be aware of that. And if you think that with spring-data you could forget about JPA basics - don't count on that. For better or worse it's still there and it will shout back in your face if you don't know how to use it efficiently.
