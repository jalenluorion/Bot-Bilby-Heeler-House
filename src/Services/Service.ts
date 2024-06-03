class Service {
    public data: ServiceBuilder;
    public dependencies: ServiceDependences;

    constructor() {}

    setDependencies(dependencies) {
        dependencies = dependencies;
    }
}

class ServiceBuilder {
    public name: string;
    public description: string;
    public dependencies: ServiceDependences;
}

interface ServiceDependences {
    [key: string]: Service
}