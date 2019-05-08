## Reapex

Reapex is a tiny framework to build pluggable and extendable redux(react) application, and it can integrate with existing react/redux application smoothly.

Reapex is created to serve the following purpose:

#### As a developer, I want to configure and start a react/redux application quickly.

> Managing a react/redux scaffolding isn't an exciting job. create-react-app could help a bit here, but Reapex let you create a react/redux application in just a few lines of code.

#### As a developer, I get tired of writing and maintaining Action Types, and I want to get rid of writing every Action Creator manually.

> Action Types are just string constants, and Action Creators are "function constants". One can derive Action Type and Action Creator from a reducer function. Why would I have to create them manually? 

> Reapex simplified the creation of Action Type/Action Creator/Reducer and combined them to one concept which is called "Mutation". A Mutation is simply a pure function which takes input parameters + state and returns the new state.

#### As the application grows, the code should be robust enough to scale.

> Reapex is designed in a way that modules have a clear boundary with each other, and code split/dynamic loading is in the bone. Modules which baked with redux/redux-saga can be shared in different applications and Reapex support plugin which makes it easy to publish these reusable modules to npm as well.
