<template lang="pug">
tm-page.page-bond(title="Staking")
  div(slot="menu"): tool-bar
  tm-part(:title="`Stake your ${totalAtoms} ${bondingDenom}`"): tm-form-struct( :submit="onSubmit")
    .bond-group(:class="bondGroupClass(unbondedAtomsDelta)")
      .bond-group__fields
        .bond-bar
          label.bond-bar__label Unbonded {{ bondingDenom }}
          .bond-bar__input
            .bond-bar-old__outer
              .bond-bar-old__inner(:style="styleBondBarInner(oldUnbondedAtoms)")
            .bond-bar__outer
              .bond-bar__inner(
                :style="styleBondBarInner(newUnbondedAtoms)")
        .bond-percent
          label.bond-delta
            span(v-if="unbondedAtomsDeltaPct !== '0%'") {{ unbondedAtomsDeltaPct }}
          tm-field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(newUnbondedAtoms)")
        .bond-value
          label.bond-delta
            span(v-if="unbondedAtomsDelta !== 0") {{ unbondedAtomsDelta }}
          tm-field.bond-value__input#new-unbonded-atoms(
            disabled
            type="number"
            placeholder="0"
            :value="newUnbondedAtoms")
      tm-form-msg(type="between"
        v-if="newUnbondedAtoms < 0")
        | You can't stake more {{bondingDenom}}s than you have

    .bond-group.bond-candidate(
      v-for='(d, index) in fields.delegates'
      :key='d.id'
      :error='$v.fields.delegates.$each[index].$error'
      :class="bondGroupClass(delta(d.atoms, d.oldAtoms))")
      .bond-group__fields
        .bond-bar
          label.bond-bar__label(v-if="!d.delegate.revoked") {{ d.delegate.moniker }}
          label.bond-bar__label.revoked(v-if="d.delegate.revoked") {{ d.delegate.moniker }}
          label.bond-bar__revoked(v-if="d.delegate.revoked") REVOKED
          .bond-bar__input
            .bond-bar-old__outer
              .bond-bar-old__inner(
                :style="styleBondBarInner(d.oldAtoms)"
                v-if="d.oldAtoms > 0")
            .bond-bar__outer
              .bond-bar__inner(:id="'delegate-' + d.id"
                :style="styleBondBarInner(d.atoms)")
        .bond-percent
          label.bond-delta
            span(v-if="d.deltaAtomsPercent !== '0%'") {{ d.deltaAtomsPercent }}
          tm-field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(d.atoms)")
        .bond-value
          label.bond-delta
            span(v-if="d.deltaAtoms !== 0") {{ d.deltaAtoms }}
          tm-field.bond-value__input(
            type="number"
            placeholder="0"
            step="1"
            min="0"
            :max="totalAtoms"
            v-model.number="d.atoms"
            @keyup.native="limitMax(d, parseInt($event.target.max))"
            @change.native="limitMax(d, parseInt($event.target.max))"
          )

      tm-form-msg(:name="bondingDenom + 's'" type="required"
        v-if="!$v.fields.delegates.$each[index].atoms.required")
      tm-form-msg(name="bondingDenom + 's'" type="numeric"
        v-if="!$v.fields.delegates.$each[index].atoms.numeric")

    .bond-group.bond-group--unbonding(
      v-if="oldBondedAtoms > 0"
      :class="bondGroupClass(newUnbondingAtomsDelta)")
      .bond-group__fields
        .bond-bar
          label.bond-bar__label Unbonding&hellip;
          .bond-bar__input
            // TODO: different color for old unbonding atoms
            // .bond-bar-old__outer
              .bond-bar-old__inner(:style="styleBondBarInner(oldUnbondingAtoms)")
            .bond-bar__outer(v-if="newUnbondingAtoms")
              .bond-bar__inner(
                :style="styleBondBarInner(newUnbondingAtoms)")
        .bond-percent
          label.bond-delta
            span(v-if="newUnbondingAtomsDeltaPct !== '0%'") {{ newUnbondingAtomsDeltaPct }}
          tm-field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(newUnbondingAtoms)")
        .bond-value
          label.bond-delta
            span(v-if="newUnbondingAtomsDelta !== 0") {{ newUnbondingAtomsDelta }}
          tm-field.bond-value__input#new-unbonding-atoms(
            disabled
            type="number"
            placeholder="0"
            :value="newUnbondingAtoms")

    tm-form-group(field-id="bond-confirm" field-label=''
      :error='$v.fields.bondConfirm.$error')
      tm-form-msg(v-if="showsRevokedValidators") A revoked validator is not validating and therefore is not producing rewards. The revoked state may be temporary.
      .tm-field-checkbox
        .tm-field-checkbox-input
          input#bond-confirm(type="checkbox" v-model="fields.bondConfirm")
        label.tm-field-checkbox-label(for="bond-confirm")
          | Yes, update my stake. I understand unbonding will take 30 days.
      tm-form-msg(name="Bonding Confirmation" type='required'
        v-if='!$v.fields.bondConfirm.required')

    div(slot='footer')
      tm-btn(v-if="delegating" type="button" value="Reset" disabled="true")
      tm-btn#btn-reset(v-else type="button" @click.native="resetFields" value="Reset" color="danger")
      tm-btn(v-if="delegating" value="Sending..." disabled="true" color="primary")
      tm-btn(v-else-if='!connected' value='Connecting...' disabled color="primary")
      tm-btn#btn-bond(v-else value="Submit" color="primary" )
</template>

<script>
import { between, numeric, required } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
import num from "scripts/num"
import {
  TmBtn,
  TmFormGroup,
  TmFormStruct,
  TmPage,
  TmPart,
  TmField,
  TmFormMsg
} from "@tendermint/ui"

import FieldAddon from "common/TmFieldAddon"
import ToolBar from "common/TmToolBar"
export default {
  name: "page-bond",
  components: {
    TmBtn,
    TmField,
    FieldAddon,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    TmPage,
    TmPart,
    ToolBar
  },
  computed: {
    ...mapGetters([
      "shoppingCart",
      "user",
      "delegation",
      "connected",
      "bondingDenom"
    ]),
    totalAtoms() {
      return (
        parseInt(this.user.atoms) + this.oldBondedAtoms + this.oldUnbondingAtoms
      )
    },
    oldBondedAtoms() {
      return Object.values(this.delegation.committedDelegates).reduce(
        (sum, d) => sum + parseInt(d),
        0
      )
    },
    oldUnbondedAtoms() {
      return this.totalAtoms - this.oldBondedAtoms
    },
    newUnbondedAtoms() {
      return this.fields.delegates.reduce((atoms, d) => {
        let delta = parseInt(d.oldAtoms) - parseInt(d.atoms)
        if (delta < 0) {
          return atoms + delta
        }
        return atoms
      }, this.oldUnbondedAtoms)
    },
    oldUnbondingAtoms() {
      return Object.values(this.delegation.unbondingDelegations).reduce(
        (atoms, value) => {
          return atoms + value
        },
        0
      )
    },
    newUnbondingAtoms() {
      return this.fields.delegates.reduce((atoms, d) => {
        let delta = d.oldAtoms - d.atoms
        if (delta > 0) {
          return atoms + delta
        }
        return atoms
      }, this.oldUnbondingAtoms)
    },
    newUnbondingAtomsDelta() {
      return this.delta(this.newUnbondingAtoms, 0)
    },
    newUnbondingAtomsDeltaPct() {
      return this.percent(this.newUnbondingAtomsDelta, this.totalAtoms)
    },
    unbondedAtomsDelta() {
      return this.delta(this.newUnbondedAtoms, this.oldUnbondedAtoms)
    },
    unbondedAtomsDeltaPct() {
      return this.percent(this.unbondedAtomsDelta, this.totalAtoms)
    },
    showsRevokedValidators() {
      return !!this.fields.delegates.find(d => d.delegate.revoked)
    },
    userCanDelegate() {
      return this.shoppingCart.length > 0 || this.user.atoms > 0
    }
  },
  data: () => ({
    delegating: false,
    bondBarScrubWidth: 28,
    bondBarOuterWidth: 0,
    minimumAtoms: 0,
    fields: {
      bondConfirm: false,
      delegates: []
    },
    num: num
  }),
  methods: {
    async onSubmit() {
      if (this.newUnbondedAtoms < 0) {
        this.$store.commit("notifyError", {
          title: `Too Many Allocated ${this.bondingDenom}`,
          body: `You've tried to stake ${this.newUnbondedAtoms * -1} more ${
            this.bondingDenom
          } than you have.`
        })
        return
      }
      this.$v.$touch()
      if (!this.$v.$error) {
        try {
          this.delegating = true
          await this.$store.dispatch("submitDelegation", this.fields.delegates)
          this.$store.commit("notify", {
            title: "Successful Staking!",
            body: `You have successfully staked your ${this.denom}s.`
          })
          this.$router.push("/staking")
        } catch (err) {
          let errData = err.message.split("\n")[5]
          if (errData) {
            let parsedErr = errData.split('"')[1]
            this.$store.commit("notifyError", {
              title: `Error While Staking ${this.bondingDenom}s`,
              body: parsedErr[0].toUpperCase() + parsedErr.slice(1)
            })
          } else {
            this.$store.commit("notifyError", {
              title: `Error While Staking ${this.bondingDenom}s`,
              body: err.message
            })
          }
        } finally {
          this.delegating = false
        }
      }
    },
    resetFields() {
      let committedDelegations = this.delegation.committedDelegates
      let totalAtoms = this.totalAtoms
      this.fields.bondConfirm = false
      this.fields.delegates = this.shoppingCart.map(c =>
        JSON.parse(JSON.stringify(c))
      )
      this.fields.delegates = this.fields.delegates.map(d => {
        let atoms = committedDelegations[d.delegate.id] || 0
        d.atoms = parseFloat(atoms)
        d.oldAtoms = d.atoms
        d.bondedRatio = d.atoms / totalAtoms
        d.deltaAtoms = 0
        d.deltaAtomsPercent = "0%"
        return d
      })
    },
    leaveIfBroke() {
      if (!this.userCanDelegate) {
        this.$store.commit("notifyError", {
          title: `Cannot Stake Without ${this.bondingDenom}s`,
          body: `You do not have any ${
            this.bondingDenom
          } to stake to validators.`
        })
        this.$router.push("/staking")
      }
    },
    leaveIfEmpty(count) {
      if (count === 0) {
        this.$store.commit("notifyError", {
          title: "No Validators Selected",
          body: `Select one or more validators before proceeding.`
        })
        this.$router.push("/staking")
      }
    },
    bondBarPercent(dividend) {
      let divisor = this.totalAtoms
      let ratio = Math.round(dividend / divisor * 100)
      if (isNaN(ratio)) ratio = 0
      return ratio + "%"
    },
    bondBarInnerWidth(dividend) {
      let offset = this.bondBarScrubWidth
      let maxWidth = this.bondBarOuterWidth
      let divisor = this.totalAtoms
      let ratio = Math.round(dividend / divisor * 100) / 100
      let width = ratio * (maxWidth - offset) + offset
      if (width > maxWidth) width = maxWidth
      return width + "px"
    },
    styleBondBarInner(dividend) {
      return { width: this.bondBarInnerWidth(dividend) }
    },
    bondGroupClass(delta) {
      if (delta > 0) {
        return "bond-group--positive"
      } else if (delta < 0) {
        return "bond-group--negative"
      } else {
        return "bond-group--neutral"
      }
    },
    handleResize(element, width) {
      let offset = this.bondBarScrubWidth
      let ratio =
        Math.round((width - offset) / (this.bondBarOuterWidth - offset) * 100) /
        100
      let rawAtoms = ratio * this.totalAtoms

      element.style.width = width + "px"

      return this.updateDelegateAtoms(element.id.split("-")[1], rawAtoms)
    },
    updateDelegateAtoms(delegateId, rawAtoms) {
      let d = this.fields.delegates.find(d => d.id === delegateId)
      d.bondedRatio = rawAtoms / this.totalAtoms
      d.atoms = Math.round(rawAtoms)
      d.deltaAtoms = this.delta(rawAtoms, d.oldAtoms, "int")
      d.deltaAtomsPercent = this.percent(
        this.delta(d.atoms, d.oldAtoms),
        this.totalAtoms
      )
      return d
    },
    setBondBarOuterWidth() {
      let outerBar = this.$el.querySelector(".bond-bar__outer")
      this.bondBarOuterWidth = outerBar.clientWidth
    },
    delta(current, previous, fmt) {
      let x = current - previous
      if (fmt === "int") {
        return Math.round(x)
      } else {
        return x
      }
    },
    percent(dividend, divisor, sigFigs) {
      let ratio = dividend / divisor
      let value
      if (Number.isInteger(sigFigs)) {
        value =
          Math.round(ratio * 100 * Math.pow(10, sigFigs)) /
          Math.pow(10, sigFigs)
      } else {
        value = Math.round(ratio * 100)
      }
      return value + "%"
    },
    limitMax(delegate, max) {
      delegate.atoms = parseFloat(delegate.atoms) // for stuff like 0-101-9
      if (delegate.atoms >= max) {
        delegate.atoms = max
      } else if (delegate.atoms < 0) {
        delegate.atoms = 0
      }
      return
    }
  },
  async mounted() {
    this.leaveIfBroke(this.user.atoms)
    this.leaveIfEmpty(this.shoppingCart.length)
    this.resetFields()

    await this.$nextTick()
    this.setBondBarOuterWidth()
  },
  watch: {
    shoppingCart(newVal) {
      this.leaveIfEmpty(newVal.length)
      this.resetFields()
    }
  },
  validations: () => ({
    fields: {
      bondConfirm: { required },
      delegates: {
        $each: {
          atoms: {
            required,
            numeric,
            between(atoms, parentVm) {
              let otherDelegates = this.fields.delegates.filter(
                d => d.id !== parentVm.id
              )
              let otherBondedAtoms = otherDelegates.reduce(
                (sum, d) => sum + (d.atoms || 0),
                0
              )
              let maximumAtoms = this.totalAtoms - otherBondedAtoms
              return between(this.minimumAtoms, maximumAtoms)(atoms)
            }
          }
        }
      }
    }
  })
}
</script>

<style lang="stylus">
@require '~variables'

.bond-group
  padding 0.5rem 1rem
  display block

.bond-group--positive
  .bond-bar-old__outer
    z-index z(listItem)
    pointer-events none

  .bond-bar__inner
    background var(--success)

  .bond-delta
    color var(--success)

    span:before
      content '+'
      display inline

  &.bond-group--unbonding
    .bond-bar__inner
      background var(--warning)

    .bond-delta
      color var(--warning)

.bond-group--negative
  .bond-bar-old__inner
    background var(--bc)

  .bond-delta
    color var(--dim)

.bond-group__fields
  display flex
  flex-flow row nowrap
  height 4rem

.bond-bar
  flex 16
  margin-right 1rem
  min-width 10rem

.bond-bar__label
  line-height 2rem
  color var(--txt)
  font-size x
  text-align left

.bond-bar__label.revoked
  text-decoration line-through

.bond-bar__revoked
  color red
  font-weight bold
  margin-left 6px

.bond-bar__input
  height 2rem
  border-radius 1rem
  border 1px solid var(--bc)
  padding 1px
  position relative

.bond-bar__outer, .bond-bar-old__outer
  height 2rem - 4 * px
  border-radius 1rem
  position absolute
  top 1px
  left 1px
  right 1px
  bottom 1px

.bond-bar__inner, .bond-bar-old__inner
  height 2rem - 0.25rem
  border-radius 1rem
  background var(--dim)
  width 50%
  min-width 2rem - 0.25rem

.bond-bar__inner
  position relative
  // debug
  color var(--app-bg)
  font-size xs
  padding 0 0.5rem
  display flex
  align-items center

.bond-delta
  height 2rem
  display block
  display flex
  align-items center
  justify-content flex-end

  span
    font-size sm
    font-weight 500

.bond-percent, .bond-value
  input
    text-align right

.bond-percent
  flex 3
  max-width 3.75rem
  margin-right 1rem

.bond-value
  flex 6
  max-width 8rem
</style>
