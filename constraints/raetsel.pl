:- use_module(library(clpfd)).

w(add).
w(ado).
w(age).
w(ago).
w(aid).
w(ail).
w(aim).
w(air).
w(and).
w(any).
w(ape).
w(apt).
w(arc).
w(are).
w(ark).
w(arm).
w(art).
w(ash).
w(ask).
w(auk).
w(awe).
w(awl).
w(aye).
w(bad).
w(bag).
w(ban).
w(bat).
w(bee).
w(boa).
w(ear).
w(eel).
w(eft).
w(far).
w(fat).
w(fit).
w(lee).
w(oaf).
w(rat).
w(tar).
w(tie).


word(L) :-
	w(W),
	atom_chars(W, L).


solution(M) :-
	is_3_x_3(M),
	rows_are_words(M),
	columns_are_words(M).


is_3_x_3([[_,_,_],[_,_,_],[_,_,_]]).


rows_are_words([]).

rows_are_words([Z | R]) :-
	word(Z),
	rows_are_words(R).


columns_are_words(M) :-
	transpose(M, MT),
	rows_are_words(MT).

