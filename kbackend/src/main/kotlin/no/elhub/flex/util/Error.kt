package no.elhub.flex.util

import arrow.core.Either

infix fun <A, B> Either<A, B>.orElse(other: () -> Either<A, B>): Either<A, B> =
    this.fold({ other() }, { Either.Right(it) })
