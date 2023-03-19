# Building a docker image

There are pre-defined dockerfiles in `dockerfiles`, however, you could defined your own, but keep in mind that the image must follow the naming convention defined in the `src/types/types`.  
In order to build an image, run
`docker build -f dockerfiles/<image-name>.Dockerfile -t <image-name> .`
