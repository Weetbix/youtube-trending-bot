#### The Brain

The brain is where the magic happens.

It's a separate micro service node app which holds the markov instance, and updates it reguarly with new comments from youtube trending.

It exposes a RESTful API which allows you to generate comments and so on. This allows you to hook up multiple consumers to the service.
