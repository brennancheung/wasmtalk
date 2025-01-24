# WasmTalk

## Long term vision

The long term vision for this repo is to create something akin to SmallTalk but
with WebAssembly and more aligned with functional programming and
type driven development.  The ultimate goal is to experiment with different paradigms
and see how productive a programmer can become given the right tools.

## Motivation

Programming hasn't changed much in the last 50+ years.  We are still mainpulating
a 2D grid of characters, saving to a source file, then invoking a compiler that
runs through the standard lex, parse, analyze, and code-gen phases.

I seek to explore the following:

* Interactive and realtime feedback during development
* Replace files in favor of UI-based code organization (Smalltalk)
* Incremental compilation (existing code stored in "image")
* Structured "code" editor to manipulate the "AST" directly
* Multiple UI tools for different development tasks
* Cater to power users / experts instead of beginners

## Desired features

* WebAssembly modules compiled directly from the UI in the UI
* Able to browse through code of modules
* Able to save modules and have them loaded in an "image"
* Manipulate the UI from within the UI itself
* Emphasis on type driven development and functional programming

## Concepts

### Interactive development

_Fast interactive feedback loops_ lead to faster development and less errors.  This is caused by:

* Reduced discrepancy between what the developer has in their head and reality.
* Less cognitive strain when program state is immediately visible (no playing computer in your head).
* No guessing (and mistaking) the intermediary types and values you are working with.
* Less context switching from looking up and reading function / type definitions in other files.

Developers often play through the computer's steps in their heads when they are writing code.
This requires keeping track of all the relevant variables and running through the code as the
computer would.  This requires an enormous amount of concentration and cognitive strain.  If you
get one thing wrong in the beginning it throws off all the following code because you are working
with a faulty assumption.


[Cognitive psychology](https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two) tells us
there are limits to the number of things we can hold in our head at any given moment.  The more state
that is present in a section of code, and the more steps we need to process,
the slower and more error prone development becomes.

An interactive development environment would allow the developer to see the current state of things
while they are developing without having to process it themselves.  This means no wasted time and energy
thinking about the state of variables at a given moment&mdash;and no mistaking the wrong values and/or types!

Why not let the computer play computer?

Here's an early prototype of what that could look like:

![Dynamic Development](https://raw.githubusercontent.com/brennancheung/wasmtalk/master/public/dynamic-compilation.gif)

In the real world, we manipulate objects and we see the result after every manipulation.

Imagine if we lived in a world where in order to get anything done we have to think,
ok the door is 3 feet away, if I take 4 steps from my current location, raise my arm 65 degrees,
close my fingers, twist the door knob 90 degrees clockwise, then pull towards me, then that should cause
the door to open.  Oops, that didn't quite work, where did it break down, let me see what the state of
the world is at certain points by logging them out.  [2 minutes later].  Ok, I see where I went wrong,
I forgot to turn my body towards the door, let me try rotating my body 45 degrees clockwise first.
[30 minutes later the door is finally opened]

It's an absurd example but it is not far off from how we currently do development.  When the current
state of the program is in front of us each step of the way, there is less chance for error and we don't
have to keep replaying the scenario over and over.

This one principle alone would dramatically improve development.

### RPN based development

The high level model we use to interact with the real world is as follows:

`Perceive current state` -> `determine suitable action` -> `perform action` -> `evaluate` -> `repeat`

The RPN or stack based development model is a close natural fit to this.  When done interactively,
we are able to see the result each step of the way.

We can see the values on the stack and the interactive compiler can determine and even suggest the
next valid action based on the number of values and their types.

The process of writing a function is: specifying some sample input values and their corresponding types
and then working through the problem interactively until we arrive at our desired result.  The steps
we take to get there are recorded and the AST is generated from that.

Note: There are other paradigms like the Mathematica / Jupyter notebook model.  This has the added
benefit of documentation and being able to experiment.  The actual development environment could be
augmented and probably won't be a pure stack.  There might be multiple stacks, the user might store
variables in named variables, or there may be wizard / visual canvas based code generation tools.
I'm choosing to start with the interactive stack based model because it seems the closest and easiest
to figure out how to get to compiled code.

### Test Driven Development

I envision a flow as follows:

1.  Programmer creates a function by defining its name, description, and relevant
organizational metadata.
2.  Programmer specifies 1 or more test scenarios with sample input values (and types) and
corresponding output.
3.  Programmer selects a test scenario and interactively works within the REPL until the desired
result is achieved.
4.  IDE shows result of other test scenarios with every interactive change.
5.  When all tests pass, the function is known to be complete.

Future versions might incorporate autocompletion assistants and even an AI helper to automatically
generate the function.  Given a set of input value(s) and the expected output, the assistant
searches for a solution that satisfies the test scenarios.

Furthermore, when other programmers want to know how the function works, one of the interactive
tools they can use will be to select a test scenario and interactively replay the steps.

### Reading code

Of course, reading a stack based language can be quite difficult because it requires even more
state to be tracked.  But there's no reason the way we _write_ code and the way we _read_ it needs
to be the same.  In fact, _it shouldn't be_!  They are radically different use cases that require
radically different representations.

We can take the generated AST and visualize it in any number of different ways that are convenient
to the developer based on the level of detail they want to go into and their current task.
Maybe they only need to know the input and output types of a function.  Maybe they want to
collapse or filter away the lower level details.  All this can be done interactively by the
developer browsing through the "code".

When looking at existing code the programmer can select how they want to view it.  This might be
a prefix based notation (Lisp style S-expressions), a conventional notation common with most
mainstream languages, a graphical representation, or any other notations that might be useful.

### Cater to power users and experts

Few programming languages cater to expert users.  I wish to explore what is possible
when programmers are given the right tools and when they dedicate themselves to constant
learning and deliberate practice.

Programming tools like Vim are known to be difficult to learn, but are they actually hard to use?
Well, it depends on how well you know it.  Most people who have spent the time to learn Vim well
will tell you it is much easier to get their job done than with alternative tools that are much
easier to learn.  They will often complain and feel frustrated that it takes much more
effort to get the same amount of work done.

In general, the more concepts, paradigms, and deliberate practice a programmer puts in the more
proficient they become with writing software.

Take the following code example that a beginning JavaScript programmer might write:

```javascript
function x2(arr) {
    let newArr = []
    for (let i=0; i<arr.length; i++) {
        let value = arr[i]
        newArr.push(value * 2)
    }
    return newArr
}
```

As a programmer becomes more experienced they learn new concepts (like `map`) and they might
write it like this:

```javascript
const x2 = arr => arr.map(n => n * 2)
```

The latter is much easier to read and write, is less error prone, and involves much less thinking.  But
to a programmer that is not aware of these concepts they don't know how to read it.  They are effectively
cut off until they learn what `map` does.

As programmers learn other languages, partial application, and point-free composition; they might express it like:

```haskell
x2 = map (* 2)
```

It stands to reason that the more concepts and paradigms a programmer knows, the more efficient and
expressive they can be.  By expanding the available representations&mdash;and I would argue
paradigms&mdash;we become more capable and productive.

There is a concept called [Linguistic Relativity](https://en.wikipedia.org/wiki/Linguistic_relativity#Programming_languages) that stipulates that our language influences the way
we think and possibily even what thoughts are even possible.

The famous Paul Graham essay [Beating the Averages](http://www.paulgraham.com/avg.html) talks
about using expert languages as a "secret weapon".  He also uses the fictional "Blub" programming
language to illustrate how different programmers perceive other languages based on on what they
are already familiar with.

Programmers can fall anywhere on the this spectrum and there is always a constant balancing act
between choosing what allows well versed and experienced programmers to work efficiently and
allowing more junior developers to be able to participate.

This project is primarily an exploration of what is possible, so becoming popular and catering
to junior developers is not a goal at this point in time.  That may evolve as productive paradigms
are discovered and if the UI paradigms are easy to use.

### Emphasis on Type Driven Development

I think Edwin Brady, creator of the [Idris language](https://www.idris-lang.org/), said it best:

> This project aims to improve the program development process, using a process of "Type-driven Development". We believe that in order to enable the highest levels of productivity, programming should be a conversation between the programmer and the machine. In type-driven development, we begin by giving a type as a plan for a program. Then the machine, rather than being seen as an adversary which rejects incomplete or incorrect programs, is the programmer's assistant. A limited form of this idea exists in modern integrated development environments: when typing "x." into a text buffer, the environment will show with methods "x" implements. This project will take this idea several steps further. Not only can we give feedback on partial programs, we can also use types and their structure to generate significant parts of a program and direct the implementation of more complex components such as communication and security protocols.

> During development, programs spend most of their time in an incomplete state, and the act of programming is as much about the steps required to achieve a complete program as it is about the end result. Accordingly, language implementations and tools must support the editing process as well as check and compile the end result. In this project, we will develop the necessary tooling to support interactive type-driven development, based on sound theoretical foundations. Furthermore, we will make the tooling itself programmable: the foundations will essentially give a language of programming "tactics", which will be composable intro sophisticated methods for automatic program construction, directed by the type. We will liaise with industry throughout to ensure that the techniques we develop are well-suited to commercially relevant problems.

&mdash; https://gtr.ukri.org/projects?ref=EP%2FT007265%2F1

I share this philosophy and wish to add a small tweak.  I hypothesize that an RPN based interactive
environment combined with Type Driven Development would lead to an extremely productive programming
environment.

## Notable influences

* Smalltalk
* Haskell
* Forth, Factor
* Idris
* [The Mother of All Demos](https://www.youtube.com/watch?v=yJDv-zdhzMY)
* [Augmenting Human Intellect: A Conceptual Framework](https://www.dougengelbart.org/content/view/138)
* [Beating the Averages](http://www.paulgraham.com/avg.html)
* [Notation as a Tool of Thought](https://dl.acm.org/doi/10.1145/358896.358899), APL

## Short term goals

* Explore compiler backends and AST's amenable to dynamic compilation 
* Learn how to write a compiler for simple ML-like language
* Determine AST suitable for realtime / interactive compilation
* Learn Idris
* Prototype interactive test driven development flow

## Completed goals

* Experiment with WebAssembly from the ground up to gain expertise.
* Compile the bytes of a `.wasm` `ArrayBuffer` directly within UI.
* Implement MVP compiler to create `add` function.
* Create Jest tests to make development faster.
* Implement basic design with UIkit
