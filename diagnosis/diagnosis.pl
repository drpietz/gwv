variable(battery).
variable(key).
variable(starter).
variable(regulation).
variable(tank).
variable(pump).
variable(filter).
variable(starter).
variable(engine).

d(key, battery).
d(starter, key).
d(regulation, battery).
d(regulation, key).
d(pump, regulation).
d(pump, tank).
d(filter, pump).
d(engine, starter).
d(engine, filter).


d_trans(X, Y) :-
	d(X, Y).

d_trans(X, Z) :-
	d(X, Y),
	d_trans(Y, Z).

depends_on(X, X).

depends_on(X, Y) :-
	d_trans(X, Y).


noise(starter).
noise(engine).
noise(pump).


a(Noises, Reasons) :-
	findall(N, (noise(N), \+(member(N, Noises))), MissingNoises),
	min_diagnosis_no_dups(MissingNoises, Reasons),
	\+((
	    member(Noise, Noises),
	    depends_on(Noise, Dependency),
	    member(Dependency, Reasons)
	)).


min_diagnosis_no_dups(Broken, Reasons) :-
	findall(SRs, (min_diagnosis(Broken, Rs), sort(Rs, SRs)), AllReasons),
	sort(AllReasons, SAllReasons),
	member(Reasons, SAllReasons).


min_diagnosis(Broken, Reasons) :-
	findall(V, variable(V), Vars),
	subs(Reasons, Vars),
	explains(Reasons, Broken),
	\+((
	    subs(MReasons, Reasons),
	    MReasons \= Reasons,
	    explains(MReasons, Broken)
	)).


explains(_, []).

explains(Reasons, [MNoise | RNoise]) :-
	member(Reason, Reasons),
	depends_on(MNoise, Reason),
	explains(Reasons, RNoise).

subs([], []).

subs(Res, [_ | RLst]) :-
	subs(Res, RLst).

subs([A | RRes], [A | RLst]) :-
	subs(RRes, RLst).
