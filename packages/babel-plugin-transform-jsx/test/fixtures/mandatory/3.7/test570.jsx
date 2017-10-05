<scxml initial="p0" version="1.0">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
  </datamodel>

  <parallel id="p0">
    <onentry>
      <send event="timeout" delay="2s"/>
      <raise event="e1"/>
      <raise event="e2"/>
    </onentry>

    <transition event="done.state.p0s1">
      <assign location="Var1" expr={ 1 }/>
    </transition>
    <transition event="done.state.p0s2" target="s1"/>
    <transition event="timeout" target="fail"/>

    <state id="p0s1" initial="p0s11">
      <state id="p0s11">
        <transition event="e1" target="p0s1final"/>
      </state>
      <final id="p0s1final"/>
    </state>

    <state id="p0s2" initial="p0s21">
      <state id="p0s21">
        <transition event="e2" target="p0s2final"/>
      </state>
      <final id="p0s2final"/>
    </state>
  </parallel>

  <state id="s1">
    <transition event="done.state.p0" cond={ ({ Var1 }) => Var1 == 1 } target="pass"/>
    <transition event="*" target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
