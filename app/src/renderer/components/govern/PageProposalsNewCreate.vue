<template lang="pug">
tm-page(:title="`Proposal: Create ${bondingDenom}s`")
  div(slot="menu"): tool-bar
    router-link(to="/proposals/new" exact v-tooltip.bottom="'Back'")
      i.material-icons arrow_back
  tm-form-struct(:submit="onSubmit")
    tm-form-group(:error="$v.fields.title.$error"
      field-id='proposal-title' field-label='Proposal Title')
      tm-field#proposal-title(
        type="text"
        placeholder="Proposal Title"
        v-model="fields.title")
      tm-form-msg(name='Proposal Title' type='required'
        v-if='!$v.fields.title.required')
      tm-form-msg(name='Proposal Title' type='length'
        :min='titleMinLength' :max='titleMaxLength'
        v-if='!$v.fields.title.minLength || !$v.fields.title.maxLength')
    tm-form-group(:error="$v.fields.body.$error"
      field-id='proposal-body' field-label='Proposal Body')
      tm-field#proposal-body(
        type="textarea"
        placeholder="Write your proposal here..."
        v-model="fields.body")
      tm-form-msg(name='Proposal Body' type='required'
        v-if='!$v.fields.body.required')
      tm-form-msg(name='Proposal Body' type='length'
        :min='bodyMinLength' :max='bodyMaxLength'
        v-if='!$v.fields.body.minLength || !$v.fields.body.maxLength')
    div(slot="footer")
      div
      tm-btn(icon="send" value="Propose" type="submit")
</template>

<script>
import { mapGetters } from "vuex"
import { minLength, maxLength, required } from "vuelidate/lib/validators"
import {
  TmBtn,
  TmFormGroup,
  TmFormStruct,
  TmPage,
  TmField,
  TmFormMsg
} from "@tendermint/ui"
import ToolBar from "common/TmToolBar"
export default {
  name: "page-proposals-new-create",
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    TmPage,
    ToolBar
  },
  data: () => ({
    titleMinLength: 10,
    titleMaxLength: 254,
    bodyMinLength: 10,
    bodyMaxLength: 40000,
    fields: {
      title: "",
      body: ""
    }
  }),
  computed: {
    ...mapGetters(["bondingDenom"])
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit("notify", {
          title: "TODO: Create Text Proposal",
          body: "You will have successfully created a text proposal"
        })
        this.resetForm()
        this.$router.push({ name: "proposals" })
      }
    },
    resetForm() {
      this.fields = {
        title: "",
        body: ""
      }
    }
  },
  validations: () => ({
    fields: {
      title: {
        required,
        minLength(x) {
          return minLength(this.titleMinLength)(x)
        },
        maxLength(x) {
          return maxLength(this.titleMaxLength)(x)
        }
      },
      body: {
        required,
        minLength(x) {
          return minLength(this.bodyMinLength)(x)
        },
        maxLength(x) {
          return maxLength(this.bodyMaxLength)(x)
        }
      }
    }
  })
}
</script>
