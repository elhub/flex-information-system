package no.elhub.flex.auth.scope

import io.kotest.core.spec.style.FunSpec
import io.kotest.datatest.withData
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class ScopeVerbTest :
    FunSpec({
        context("covers") {
            context("same verb covers itself") {
                withData(
                    nameFn = { "$it covers $it" },
                    ScopeVerb.Read,
                    ScopeVerb.Use,
                    ScopeVerb.Manage,
                ) { verb ->
                    verb.covers(verb) shouldBe true
                }
            }

            context("higher verb covers lower") {
                withData(
                    nameFn = { "${it.first} covers ${it.second}" },
                    ScopeVerb.Use to ScopeVerb.Read,
                    ScopeVerb.Manage to ScopeVerb.Read,
                    ScopeVerb.Manage to ScopeVerb.Use,
                ) { (higher, lower) ->
                    higher.covers(lower) shouldBe true
                }
            }

            context("lower verb does not cover higher") {
                withData(
                    nameFn = { "${it.first} does not cover ${it.second}" },
                    ScopeVerb.Read to ScopeVerb.Use,
                    ScopeVerb.Read to ScopeVerb.Manage,
                    ScopeVerb.Use to ScopeVerb.Manage,
                ) { (lower, higher) ->
                    lower.covers(higher) shouldBe false
                }
            }
        }

        context("fromString") {
            context("valid verbs") {
                withData(
                    nameFn = { "parses '${it.first}'" },
                    "read" to ScopeVerb.Read,
                    "use" to ScopeVerb.Use,
                    "manage" to ScopeVerb.Manage,
                    "READ" to ScopeVerb.Read,
                    "USE" to ScopeVerb.Use,
                    "MANAGE" to ScopeVerb.Manage,
                    "Read" to ScopeVerb.Read,
                    "Use" to ScopeVerb.Use,
                    "Manage" to ScopeVerb.Manage,
                ) { (input, expected) ->
                    ScopeVerb.fromString(input) shouldBe expected
                }
            }

            context("invalid verbs") {
                withData(
                    nameFn = { "'$it' returns null" },
                    "",
                    "invalid",
                    "delete",
                    "write",
                    "admin",
                ) { input ->
                    ScopeVerb.fromString(input) shouldBe null
                }
            }
        }
    })

class ScopeTest :
    FunSpec({
        context("toString") {
            withData(
                nameFn = { "serialises to '${it.second}'" },
                Scope(ScopeVerb.Read, "auth") to "read:auth",
                Scope(ScopeVerb.Use, "data:controllable_unit") to "use:data:controllable_unit",
            ) { (scope, expected) ->
                scope.toString() shouldBe expected
            }
        }

        context("fromString") {
            context("valid scope strings") {
                withData(
                    nameFn = { "parses '${it.first}'" },
                    "read:auth" to Scope(ScopeVerb.Read, "auth"),
                    "use:data:controllable_unit" to Scope(ScopeVerb.Use, "data:controllable_unit"),
                ) { (input, expected) ->
                    Scope.fromString(input) shouldBe expected
                }
            }

            context("invalid scope strings") {
                withData(
                    nameFn = { "'$it' returns null" },
                    "",
                    "read",
                    "invalid:users",
                    ":",
                ) { input ->
                    Scope.fromString(input) shouldBe null
                }
            }
        }

        context("covers") {
            context("returns true") {
                withData(
                    nameFn = { it.third },
                    Triple(
                        Scope(ScopeVerb.Read, "auth"),
                        Scope(ScopeVerb.Read, "auth"),
                        "identical scopes",
                    ),
                    Triple(
                        Scope(ScopeVerb.Manage, "data"),
                        Scope(ScopeVerb.Read, "data"),
                        "higher verb covers lower on same asset",
                    ),
                    Triple(
                        Scope(ScopeVerb.Use, "data"),
                        Scope(ScopeVerb.Read, "data"),
                        "use covers read on same asset",
                    ),
                    Triple(
                        Scope(ScopeVerb.Read, "data"),
                        Scope(ScopeVerb.Read, "data:technical_resource"),
                        "parent asset covers child asset",
                    ),
                    Triple(
                        Scope(ScopeVerb.Manage, "data"),
                        Scope(ScopeVerb.Use, "data:controllable_unit"),
                        "manage:data covers use:data:controllable_unit",
                    ),
                    Triple(
                        Scope(ScopeVerb.Manage, "data:controllable_unit"),
                        Scope(ScopeVerb.Use, "data:controllable_unit:lookup"),
                        "complex nested coverage",
                    ),
                    Triple(
                        Scope(ScopeVerb.Manage, "data"),
                        Scope(ScopeVerb.Use, "data:controllable_unit:lookup"),
                        "multi-level hierarchy match",
                    ),
                ) { (scope, other, _) ->
                    scope.covers(other) shouldBe true
                }
            }

            context("returns false") {
                withData(
                    nameFn = { it.third },
                    Triple(
                        Scope(ScopeVerb.Read, "data"),
                        Scope(ScopeVerb.Manage, "data"),
                        "lower verb does not cover higher on same asset",
                    ),
                    Triple(
                        Scope(ScopeVerb.Read, "data:technical_resource"),
                        Scope(ScopeVerb.Read, "data"),
                        "child asset does not cover parent asset",
                    ),
                    Triple(
                        Scope(ScopeVerb.Read, "data"),
                        Scope(ScopeVerb.Read, "auth"),
                        "different asset paths",
                    ),
                    Triple(
                        Scope(ScopeVerb.Read, "au"),
                        Scope(ScopeVerb.Read, "auth"),
                        "partial string prefix is not a valid asset prefix",
                    ),
                    Triple(
                        Scope(ScopeVerb.Read, "auth"),
                        Scope(ScopeVerb.Read, "au"),
                        "non-prefix asset does not match",
                    ),
                    Triple(
                        Scope(ScopeVerb.Read, "data"),
                        Scope(ScopeVerb.Read, "data_technical_resource"),
                        "underscore-suffixed asset is not a child",
                    ),
                ) { (scope, other, _) ->
                    scope.covers(other) shouldBe false
                }
            }
        }
    })

class ListScopeCoversTest :
    FunSpec({
        context("covers extension on List<Scope>") {
            test("returns true when one scope in the list covers the required scope") {
                val scopes = listOf(
                    Scope(ScopeVerb.Read, "auth"),
                    Scope(ScopeVerb.Use, "data:controllable_unit"),
                )
                scopes.covers(Scope(ScopeVerb.Read, "auth")) shouldBe true
            }

            test("returns true when a broader scope covers the required scope") {
                val scopes = listOf(
                    Scope(ScopeVerb.Manage, "data"),
                )
                scopes.covers(Scope(ScopeVerb.Use, "data:controllable_unit")) shouldBe true
            }

            test("returns true when a later scope in the list covers the required scope") {
                val scopes = listOf(
                    Scope(ScopeVerb.Read, "auth"),
                    Scope(ScopeVerb.Use, "data:controllable_unit"),
                )
                scopes.covers(Scope(ScopeVerb.Read, "data:controllable_unit")) shouldBe true
            }

            test("returns false when no scope in the list covers the required scope") {
                val scopes = listOf(
                    Scope(ScopeVerb.Read, "auth"),
                    Scope(ScopeVerb.Read, "data"),
                )
                scopes.covers(Scope(ScopeVerb.Manage, "data")) shouldBe false
            }

            test("returns false when list is empty") {
                emptyList<Scope>().covers(Scope(ScopeVerb.Read, "data")) shouldBe false
            }

            test("returns false when required scope is on a different asset") {
                val scopes = listOf(
                    Scope(ScopeVerb.Manage, "data"),
                )
                scopes.covers(Scope(ScopeVerb.Read, "auth")) shouldBe false
            }

            test("returned scope from fromString roundtrips correctly for list coverage check") {
                val scopes = listOf("manage:data", "read:auth")
                    .mapNotNull { Scope.fromString(it) }
                scopes shouldNotBe null
                scopes.covers(Scope(ScopeVerb.Use, "data:controllable_unit:lookup")) shouldBe true
                scopes.covers(Scope(ScopeVerb.Read, "auth")) shouldBe true
                scopes.covers(Scope(ScopeVerb.Read, "users")) shouldBe false
            }
        }
    })

class ScopeIntersectionTest :
    FunSpec({
        context("intersection of two scopes") {
            withData(
                nameFn = { it.third },
                Triple(
                    Scope(ScopeVerb.Manage, "data") to Scope(ScopeVerb.Read, "data"),
                    Scope(ScopeVerb.Read, "data"),
                    "same asset keeps the less permissive verb",
                ),
                Triple(
                    Scope(ScopeVerb.Manage, "data") to Scope(ScopeVerb.Use, "data:controllable_unit"),
                    Scope(ScopeVerb.Use, "data:controllable_unit"),
                    "the narrower asset wins when b is a child of a",
                ),
                Triple(
                    Scope(ScopeVerb.Read, "data:controllable_unit") to Scope(ScopeVerb.Manage, "data"),
                    Scope(ScopeVerb.Read, "data:controllable_unit"),
                    "the narrower asset wins when a is a child of b",
                ),
            ) { (pair, expected, _) ->
                pair.first.intersection(pair.second) shouldBe expected
            }

            test("scopes on different assets do not intersect") {
                Scope(ScopeVerb.Manage, "data").intersection(Scope(ScopeVerb.Manage, "grid")) shouldBe null
            }

            test("a partial string prefix is not an intersection") {
                Scope(ScopeVerb.Manage, "au").intersection(Scope(ScopeVerb.Manage, "auth")) shouldBe null
            }
        }

        context("intersection of two lists") {
            test("returns the sorted intersections without duplicates") {
                val a = listOf(Scope(ScopeVerb.Manage, "data"), Scope(ScopeVerb.Manage, "auth"))
                val b = listOf(Scope(ScopeVerb.Read, "data:x"), Scope(ScopeVerb.Use, "data"), Scope(ScopeVerb.Manage, "auth"))

                a.intersection(b) shouldBe listOf(
                    Scope(ScopeVerb.Manage, "auth"),
                    Scope(ScopeVerb.Use, "data"),
                    Scope(ScopeVerb.Read, "data:x"),
                )
            }

            test("the scopes of a membership are narrowed by those of an entity client") {
                val client = listOf(Scope(ScopeVerb.Use, "data"), Scope(ScopeVerb.Manage, "auth"))
                val membership = listOf(
                    Scope(ScopeVerb.Manage, "data:party_membership"),
                    Scope(ScopeVerb.Read, "data"),
                    Scope(ScopeVerb.Manage, "auth"),
                )

                client.intersection(membership) shouldBe listOf(
                    Scope(ScopeVerb.Manage, "auth"),
                    Scope(ScopeVerb.Read, "data"),
                    Scope(ScopeVerb.Use, "data:party_membership"),
                )
            }

            test("the scopes of an owned party are narrowed by those of an entity client") {
                val client = listOf(Scope(ScopeVerb.Use, "data"), Scope(ScopeVerb.Manage, "auth"))

                client.intersection(DefaultOwnedPartyScopes) shouldBe listOf(
                    Scope(ScopeVerb.Manage, "auth"),
                    Scope(ScopeVerb.Use, "data"),
                )
            }

            test("is empty when nothing intersects") {
                listOf(Scope(ScopeVerb.Manage, "data")).intersection(listOf(Scope(ScopeVerb.Manage, "grid"))) shouldBe emptyList()
            }

            test("is empty when one list is empty") {
                listOf(Scope(ScopeVerb.Manage, "data")).intersection(emptyList()) shouldBe emptyList()
            }
        }
    })
