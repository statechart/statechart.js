<scxml  version="1.0" initial="s012">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
  </datamodel>

  <state id="s0" initial="s01">
    <onentry>
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
    </onentry>

    <transition event="entering.s012" cond={ ({ Var1 }) => Var1 == 1 } target="s1">
      <send event="timeout" delay="2s"/>
    </transition>

    <transition event="entering.s012" cond={ ({ Var1 }) => Var1 == 2 } target="s2"/>
    <transition event="entering" cond={ ({ Var1 }) => Var1 == 2 } target="fail"/>

    <transition event="entering.s011" cond={ ({ Var1 }) => Var1 == 3 } target="pass"/>
    <transition event="entering" cond={ ({ Var1 }) => Var1 == 3 } target="fail"/>

    <transition event="timeout" target="fail"/>

    <history type="shallow" id="s0HistShallow">
      <transition target="s02"/>
    </history>
    <history type="deep" id="s0HistDeep">
      <transition target="s022"/>
    </history>
    <state id="s01" initial="s011">
      <state id="s011">
        <onentry>
          <raise event="entering.s011"/>
        </onentry>
      </state>
      <state id="s012">
        <onentry>
          <raise event="entering.s012"/>
        </onentry>
      </state>
    </state>
    <state id="s02" initial="s021">
      <state id="s021">
        <onentry>
          <raise event="entering.s021"/>
        </onentry>
      </state>
      <state id="s022">
        <onentry>
          <raise event="entering.s022"/>
        </onentry>
      </state>
    </state>
  </state>


  <state id="s1">
    <transition target="s0HistDeep"/>
  </state>

  <state id="s2">
    <transition target="s0HistShallow"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
